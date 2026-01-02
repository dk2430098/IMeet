"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2, Circle, Clock, Database, Globe, Trophy, Target, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import LoaderUI from "@/components/LoaderUI";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Question = {
    _id: string;
    id?: string | number;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    source?: "internal" | "external";
};

export default function PracticeDashboard() {
    const { user, isLoaded } = useUser();
    const progress = useQuery(api.practice.getUserProgress, { userId: user?.id });
    const fetchQuestions = useAction(api.practice.getHybridQuestions);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sourceFilter, setSourceFilter] = useState<"all" | "internal" | "external">("all");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchQuestions();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setQuestions(data as any as Question[]);
            } catch (error) {
                console.error("Failed to load questions:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [fetchQuestions]);

    if (!isLoaded || isLoading || progress === undefined) return <LoaderUI />;

    const solvedCount = progress.filter(p => p.status === "solved").length;
    const attemptedCount = progress.length;

    const getQuestionStatus = (id: string) => {
        // Check against both _id (internal) and custom id (external/legacy)
        const p = progress.find(p => p.questionId === id);
        if (!p) return "unattempted";
        return p.status;
    };

    // Filter questions based on source
    const filteredQuestions = questions.filter(q => {
        if (sourceFilter === "all") return true;
        if (sourceFilter === "internal") return q.source !== "external"; // Default to internal if missing
        return q.source === "external";
    });

    const categories = Array.from(new Set(filteredQuestions.map(q => q.category)));
    const displayedCategories = selectedCategory ? [selectedCategory] : categories;

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-7xl overflow-x-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-6 relative">
                {/* Decorative Background for Header */}
                <div className="absolute -top-10 -left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent pb-2">
                        Practice Arena
                    </h1>
                    <p className="text-muted-foreground mt-1 text-base md:text-lg">Sharpen your skills with our curated problem set.</p>
                </div>

                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">

                    {/* Source Filter */}
                    <div className="w-full md:w-[180px]">
                        <Select value={sourceFilter} onValueChange={(val: "all" | "internal" | "external") => setSourceFilter(val)}>
                            <SelectTrigger className="bg-background/50 backdrop-blur-sm border-white/10 w-full">
                                <SelectValue placeholder="Filter Source" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sources</SelectItem>
                                <SelectItem value="internal">Internal Database</SelectItem>
                                <SelectItem value="external">External API</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:flex">
                        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 p-3 md:p-4 md:w-36 text-center h-full flex flex-col justify-center backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-2xl md:text-3xl font-bold text-emerald-500 flex justify-center items-center gap-2">
                                <Trophy className="h-4 w-4 md:h-5 md:w-5 opacity-80" />
                                {solvedCount}
                            </div>
                            <div className="text-[10px] md:text-xs text-emerald-400/80 font-medium uppercase tracking-wider mt-1">Solved</div>
                        </Card>
                        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 p-3 md:p-4 md:w-36 text-center h-full flex flex-col justify-center backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-2xl md:text-3xl font-bold text-blue-500 flex justify-center items-center gap-2">
                                <Target className="h-4 w-4 md:h-5 md:w-5 opacity-80" />
                                {attemptedCount}
                            </div>
                            <div className="text-[10px] md:text-xs text-blue-400/80 font-medium uppercase tracking-wider mt-1">Attempted</div>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6 md:gap-8">
                {/* Categories Sidebar */}
                <Card className="md:col-span-1 h-fit sticky top-20 md:top-6 bg-background/50 backdrop-blur-sm border-white/5 shadow-lg overflow-hidden shrink-0">
                    <CardHeader className="bg-muted/10 border-b border-white/5 pb-4">
                        <CardTitle className="text-lg font-semibold tracking-wide">Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 pt-4 p-2">
                        {/* All Categories Option */}
                        <div
                            onClick={() => setSelectedCategory(null)}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer text-sm font-medium transition-colors group ${selectedCategory === null ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}`}
                        >
                            <span className={selectedCategory === null ? "font-semibold" : "group-hover:text-primary transition-colors"}>All Categories</span>
                            <Badge variant="secondary" className={`text-xs transition-colors ${selectedCategory === null ? 'bg-primary text-primary-foreground' : 'bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                {filteredQuestions.length}
                            </Badge>
                        </div>

                        {categories.map(cat => {
                            const isActive = selectedCategory === cat;
                            return (
                                <div
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer text-sm font-medium transition-colors group ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}`}
                                >
                                    <span className={isActive ? "font-semibold" : "group-hover:text-primary transition-colors"}>{cat}</span>
                                    <Badge variant="secondary" className={`text-xs transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                        {filteredQuestions.filter(q => q.category === cat).length}
                                    </Badge>
                                </div>
                            )
                        })}
                        {categories.length === 0 && <div className="text-muted-foreground text-sm p-4 text-center">No categories found.</div>}
                    </CardContent>
                </Card>

                {/* Questions Grid */}
                <div className="md:col-span-3 space-y-10">
                    {displayedCategories.map(category => (
                        <div key={category}>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-foreground/90">
                                {category}
                                <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
                            </h2>
                            <div className="grid gap-4">
                                {filteredQuestions.filter(q => q.category === category).map(q => {
                                    const qId = q._id; // Use strict ID
                                    const status = getQuestionStatus(qId);
                                    return (
                                        <Card key={qId} className="hover:shadow-lg hover:border-primary/20 transition-all duration-300 group overflow-hidden border-white/5 bg-background/40 backdrop-blur-sm">
                                            <CardContent className="p-0">
                                                <Link href={`/practice/${qId}`} className="block p-6">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-3 flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{q.title}</h3>
                                                                <Badge variant={
                                                                    q.difficulty === 'Easy' ? 'secondary' :
                                                                        q.difficulty === 'Medium' ? 'default' :
                                                                            'destructive'
                                                                } className={`text-[10px] uppercase tracking-wider font-semibold ${q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' :
                                                                    q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' :
                                                                        'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                                                                    }`}>
                                                                    {q.difficulty}
                                                                </Badge>

                                                                {/* Source Badge */}
                                                                {q.source === 'external' ? (
                                                                    <Badge variant="outline" className="text-[10px] flex items-center gap-1 bg-background/50">
                                                                        <Globe className="h-3 w-3" /> External
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-[10px] flex items-center gap-1 border-primary/20 bg-primary/5 text-primary">
                                                                        <Database className="h-3 w-3" /> Internal
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed pr-8">{q.description}</p>
                                                        </div>

                                                        <div className="flex flex-col items-center justify-between h-full pl-4 border-l border-white/5">
                                                            {status === 'solved' && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                                                            {status === 'attempted' && <Clock className="h-6 w-6 text-blue-500" />}
                                                            {status === 'unattempted' && (
                                                                <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/20 group-hover:border-primary/40 transition-colors" />
                                                            )}
                                                            <ChevronRight className="h-4 w-4 text-muted-foreground/30 mt-4 group-hover:text-primary/50 transition-colors opacity-0 group-hover:opacity-100" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredQuestions.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                            No questions found matching the selected source.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
