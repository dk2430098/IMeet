"use client";

import { useMutation, useQuery, useAction } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { LANGUAGES, type LanguageId } from "@/constants/practice";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import LoaderUI from "@/components/LoaderUI";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, CheckCircle, Play, Terminal, RefreshCcw, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import Link from "next/link";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

const Editor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.Editor), { ssr: false });

const LANGUAGE_VERSIONS: Record<string, string> = {
    javascript: "18.15.0",
    python: "3.10.0",
    java: "15.0.2",
    cpp: "10.2.0",
};

export default function PracticePage() {
    const params = useParams();
    const { user, isLoaded } = useUser();
    const id = params.id as string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [question, setQuestion] = useState<any>(null);
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);

    const getQuestionAction = useAction(api.practice.getProblem);

    useEffect(() => {
        const load = async () => {
            setIsLoadingQuestion(true);
            try {
                const q = await getQuestionAction({ id });
                setQuestion(q);
            } catch (e) {
                console.error("Failed to load question", e);
            } finally {
                setIsLoadingQuestion(false);
            }
        };
        if (id) load();
    }, [id, getQuestionAction]);

    const progress = useQuery(api.practice.getUserProgress, { userId: user?.id });
    const saveProgress = useMutation(api.practice.saveProgress);

    const [language, setLanguage] = useState<LanguageId>("javascript");
    const [code, setCode] = useState("");
    const [userCodeMap, setUserCodeMap] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string>("");
    const [activeTab, setActiveTab] = useState("testcases");

    const [customInput, setCustomInput] = useState("");
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{
        open: boolean;
        status: "pending" | "success" | "error";
        message: string;
        details?: {
            input: string;
            expected: string;
            actual: string;
        };
    }>({ open: false, status: "pending", message: "" });

    const handleRunCode = async () => {
        setIsRunning(true);
        setActiveTab("output");
        setOutput("Running code...\n");

        try {
            // Default to first test case if custom input is empty
            const inputToUse = customInput || (question?.testCases?.[0]?.input || "");

            const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: language === "cpp" ? "c++" : language,
                    version: LANGUAGE_VERSIONS[language] || "18.15.0",
                    files: [{ content: code }],
                    stdin: inputToUse,
                }),
            });

            const data = await response.json();
            if (data.run) {
                const rawOutput = data.run.output || "";
                if (rawOutput.trim()) {
                    setOutput(rawOutput);
                } else {
                    setOutput(`Process exited with code ${data.run.code} (No output)`);
                }
            } else {
                setOutput("Error: " + (data.message || "Unknown execution error"));
            }
        } catch (error) {
            setOutput("Execution failed: " + error);
        } finally {
            setIsRunning(false);
        }
    };

    // Handle Language Change
    const handleLanguageChange = (newLang: LanguageId) => {
        // Save current code
        setUserCodeMap(prev => ({ ...prev, [language]: code }));
        setLanguage(newLang);
    };

    // Load code when language or question changes
    useEffect(() => {
        if (question) {
            // Priority: Saved user code > Starter code
            const savedCode = userCodeMap[language];
            if (savedCode) {
                setCode(savedCode);
            } else {
                setCode(question.starterCode[language]);
            }
        }
    }, [question, language, userCodeMap]);

    const handleRefresh = () => {
        if (!question) return;
        setCode(question.starterCode[language]);
        toast.success("Reset to template");
    };

    // Load saved progress if available (overrides starter code on initial load)
    useEffect(() => {
        if (progress) {
            const saved = progress.find(p => p.questionId === id);
            if (saved && saved.code) {
                setCode(saved.code);

                // Also update the map so switching back preserves the loaded progress
                // Wait, we can't easily know WHICH language the saved code was for unless we stored language in DB.
                // Currently DB schema has 'starterCode' but saved progress is just 'code'.
                // If saved progress is only for ONE language, we might overwrite.
                // Assuming saved progress is irrelevant for this specific 'switching' requirement for now,
                // or that user is working mainly in one language.
            }
        }
    }, [progress, id]);

    if (!isLoaded || progress === undefined || isLoadingQuestion) return <LoaderUI />;
    if (!question) return <div className="p-10 text-center">Question not found</div>;

    const handleSave = async (status: "attempted" | "solved") => {
        if (!user) return;
        setIsSaving(true);
        try {
            await saveProgress({
                userId: user.id,
                questionId: id,
                status,
                code,
            });
            if (status !== "solved") { // Only toast if not solved (solved shows modal)
                toast.success("Progress saved");
            }
        } catch {
            toast.error("Failed to save progress");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = async () => {
        if (!user || !question) return;

        // If no test cases (e.g. system design), just save as solved
        if (!question.testCases || question.testCases.length === 0) {
            await handleSave("solved");
            toast.success("Submitted successfully!");
            return;
        }

        setIsSubmitting(true);
        setSubmitResult({ open: true, status: "pending", message: "Running test cases..." });

        let allPassed = true;

        for (const tc of question.testCases) {
            try {
                const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        language: language === "cpp" ? "c++" : language,
                        version: LANGUAGE_VERSIONS[language] || "18.15.0",
                        files: [{ content: code }],
                        stdin: tc.input,
                    }),
                });

                const data = await response.json();
                const actual = (data.run.output || "").trim();
                const expected = (tc.output || "").trim();

                if (actual !== expected) {
                    allPassed = false;
                    setSubmitResult({
                        open: true,
                        status: "error",
                        message: "Wrong Answer",
                        details: {
                            input: tc.input,
                            expected: expected,
                            actual: actual
                        }
                    });
                    break;
                }
            } catch {
                allPassed = false;
                setSubmitResult({ open: true, status: "error", message: "Execution Error" });
                break;
            }
        }

        if (allPassed) {
            setSubmitResult({ open: true, status: "success", message: "All Test Cases Passed! 🎉" });
            await handleSave("solved");
        }

        setIsSubmitting(false);
    };

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col">
            <Dialog open={submitResult.open} onOpenChange={(open) => setSubmitResult(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className={submitResult.status === "success" ? "text-green-400" : submitResult.status === "error" ? "text-red-400" : ""}>
                            {submitResult.status === "pending" ? "Judging..." : submitResult.message}
                        </DialogTitle>
                        <DialogDescription>
                            {submitResult.status === "pending" && "Running code against hidden test cases."}
                            {submitResult.status === "success" && "Great job! Your solution is correct."}
                            {submitResult.status === "error" && "Your code failed on a test case."}
                        </DialogDescription>
                    </DialogHeader>

                    {submitResult.status === "pending" && (
                        <div className="flex justify-center py-6">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {submitResult.status === "error" && submitResult.details && (
                        <div className="space-y-3 bg-slate-900 p-4 rounded-md text-sm border border-slate-700">
                            <div>
                                <span className="text-slate-400 block mb-1">Input:</span>
                                <code className="bg-slate-800 px-2 py-1 rounded block whitespace-pre-wrap">{submitResult.details.input}</code>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-1">Your Output:</span>
                                <code className="bg-red-900/30 text-red-200 px-2 py-1 rounded block whitespace-pre-wrap">{submitResult.details.actual}</code>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-1">Expected Output:</span>
                                <code className="bg-green-900/30 text-green-200 px-2 py-1 rounded block whitespace-pre-wrap">{submitResult.details.expected}</code>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        {submitResult.status !== "pending" && (
                            <Button onClick={() => setSubmitResult(prev => ({ ...prev, open: false }))}>
                                Close
                            </Button>

                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Header */}
            <div className="border-b bg-background/50 backdrop-blur p-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <Link href="/practice">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-semibold text-lg flex flex-wrap items-center gap-2">
                            {question.title}
                            <Badge variant={
                                question.difficulty === 'Easy' ? 'secondary' :
                                    question.difficulty === 'Medium' ? 'outline' :
                                        'destructive'
                            }>{question.difficulty}</Badge>
                        </h1>
                        <p className="text-sm text-muted-foreground">{question.category}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                    <Select value={language} onValueChange={(val: LanguageId) => handleLanguageChange(val)}>
                        <SelectTrigger className="w-[110px] md:w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGUAGES.map(l => (
                                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" onClick={handleRefresh} title="Reset Code">
                        <RefreshCcw className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" onClick={handleRunCode} disabled={isRunning || isSaving} className="hidden md:flex">
                        <Play className="h-4 w-4 mr-2" />
                        Run
                    </Button>
                    {/* Mobile Icon Only for Run */}
                    <Button variant="outline" size="icon" onClick={handleRunCode} disabled={isRunning || isSaving} className="md:hidden">
                        <Play className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" onClick={() => handleSave("attempted")} disabled={isSaving} className="hidden md:flex">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                    {/* Mobile Icon Only for Save */}
                    <Button variant="outline" size="icon" onClick={() => handleSave("attempted")} disabled={isSaving} className="md:hidden">
                        <Save className="h-4 w-4" />
                    </Button>

                    <Button onClick={handleSubmit} disabled={isSaving || isSubmitting} className="min-w-[100px]">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                <span className="hidden md:inline">Judging...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                <span className="hidden md:inline">Submit</span>
                                <span className="md:hidden">Submit</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left: Description */}
                <div className="w-full md:w-1/3 h-1/3 md:h-full border-r bg-muted/10 p-4 md:p-6 overflow-y-auto shrink-0">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-sm md:text-base">
                        {question.description.split(/(https?:\/\/[^\s]+)/g).map((part: string, i: number) => (
                            part.match(/https?:\/\/[^\s]+/) ? (
                                <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                                    {part}
                                </a>
                            ) : (
                                <span key={i}>{part}</span>
                            )
                        ))}
                    </p>



                </div>

                <div className="flex-1 bg-[#1e1e1e] flex flex-col">
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            language={LANGUAGES.find(l => l.id === language)?.monacoLanguage}
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => setCode(val || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 15,
                                scrollBeyondLastLine: false,
                                padding: { top: 20 },
                                automaticLayout: true,
                            }}
                        />
                    </div>

                    {/* Console/Test Cases Panel */}
                    <div className={`bg-[#1e1e1e] border-t border-slate-700 transition-all duration-300 ease-in-out ${isPanelCollapsed ? 'h-[40px]' : 'h-[250px]'}`}>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                            <div className="flex items-center justify-between px-4 bg-[#1e1e1e] border-b border-slate-800 h-[40px]">
                                <TabsList className="bg-transparent p-0 gap-4 h-full">
                                    <TabsTrigger value="input" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full text-slate-400 data-[state=active]:text-white text-xs uppercase tracking-wider font-medium">
                                        Custom Input
                                    </TabsTrigger>
                                    <TabsTrigger value="output" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-full text-slate-400 data-[state=active]:text-white text-xs uppercase tracking-wider font-medium">
                                        <Terminal className="h-3.5 w-3.5 mr-2" />
                                        Output
                                    </TabsTrigger>
                                </TabsList>
                                <button
                                    onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    {isPanelCollapsed ? (
                                        <span className="text-xs uppercase font-medium">Maximize</span>
                                    ) : (
                                        <span className="text-xs uppercase font-medium">Minimize</span>
                                    )}
                                </button>
                            </div>

                            {!isPanelCollapsed && (
                                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                                    <TabsContent value="input" className="mt-0 h-full">
                                        <textarea
                                            value={customInput}
                                            onChange={(e) => setCustomInput(e.target.value)}
                                            placeholder="Enter your custom input here..."
                                            className="w-full h-full bg-[#1e1e1e] text-slate-200 resize-none outline-none border-none focus:ring-0 font-mono text-sm"
                                            spellCheck={false}
                                        />
                                    </TabsContent>
                                    <TabsContent value="output" className="mt-0 h-full">
                                        <pre className="text-slate-200 w-full h-full whitespace-pre-wrap font-mono text-sm leading-relaxed p-2">
                                            {output || "Run code to see output..."}
                                        </pre>
                                    </TabsContent>
                                </div>
                            )}
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
