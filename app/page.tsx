"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Code2, Laptop, Terminal, Users, Video, CheckCircle2Icon, Mail, Github, Linkedin, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import { PRACTICE_QUESTIONS, LANGUAGES } from "@/constants/practice";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";

export default function LandingPage() {
    const router = useRouter();
    const { isInterviewer, isLoading } = useUserRole();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [pendingAction, setPendingAction] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && isInterviewer) {
            router.push("/dashboard");
        }
    }, [isInterviewer, isLoading, router]);

    const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        setIsSubmitting(true);

        const formUrl = process.env.NEXT_PUBLIC_FORMSPREE_URL;
        if (!formUrl || !formUrl.startsWith("http")) {
            toast.error("Contact form configuration error.");
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(formUrl, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setIsSuccess(true);
                toast.success("Message sent successfully!");
                form.reset();
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("Formspree error:", errorData);
                toast.error("Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error("Contact form error:", error);
            // Only show validation errors if they are clear, otherwise generic
            toast.error("Something went wrong. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <Video className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                IMeet
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <SignedIn>
                                <Button onClick={() => {
                                    setPendingAction("dashboard");
                                    router.push("/dashboard");
                                }} disabled={pendingAction === "dashboard"}>
                                    {pendingAction === "dashboard" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                    Go to Dashboard
                                </Button>
                            </SignedIn>
                            <SignedOut>
                                <div className="flex items-center gap-2">
                                    <SignInButton mode="modal">
                                        <Button variant="ghost">Sign In</Button>
                                    </SignInButton>
                                    <SignInButton mode="modal">
                                        <Button>Get Started</Button>
                                    </SignInButton>
                                </div>
                            </SignedOut>
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="py-20 text-center px-4">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                            Master Your Technical{" "}
                            <span className="text-primary">Interview</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Practice coding questions, simulate real interviews, and get hired.
                            The all-in-one platform for technical interview preparation.
                        </p>
                        <div className="flex justify-center gap-4 pt-4">
                            <SignedIn>
                                <Button size="lg" className="h-12 px-8" onClick={() => {
                                    setPendingAction("practice");
                                    router.push("/practice");
                                }} disabled={pendingAction === "practice"}>
                                    {pendingAction === "practice" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                    Start Practicing Now
                                </Button>
                            </SignedIn>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button size="lg" className="h-12 px-8">Start For Free</Button>
                                </SignInButton>
                            </SignedOut>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 bg-muted/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-6 rounded-2xl bg-background border shadow-sm">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <Terminal className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Live Coding</h3>
                                <p className="text-muted-foreground">
                                    Practice with our integrated Monaco editor supporting multiple languages.
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl bg-background border shadow-sm">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <Video className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Video Interviews</h3>
                                <p className="text-muted-foreground">
                                    Simulate real interview environments with HD video and audio.
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl bg-background border shadow-sm">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Mock Interviews</h3>
                                <p className="text-muted-foreground">
                                    Sessions scheduled by admin with interviewers and candidates.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Coding Practice Section */}
                <section id="practice" className="py-20 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Practice Coding Questions</h2>
                            <p className="text-muted-foreground">
                                Sharpen your skills with real interview problems across {LANGUAGES.length} languages.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            {/* Question List */}
                            <div className="bg-card rounded-xl border shadow-sm flex flex-col h-[500px]">
                                <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                                    <h3 className="font-semibold">Featured Problems</h3>
                                    <div className="flex gap-2">
                                        <SignedIn>
                                            <Link href="/practice">
                                                <Button variant="ghost" size="sm" className="text-xs">
                                                    View All <Users className="h-3 w-3 ml-2" />
                                                </Button>
                                            </Link>
                                        </SignedIn>
                                        <SignedOut>
                                            <SignInButton mode="modal">
                                                <Button variant="ghost" size="sm" className="text-xs">
                                                    View All <Users className="h-3 w-3 ml-2" />
                                                </Button>
                                            </SignInButton>
                                        </SignedOut>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1">
                                    <div className="p-4 space-y-3">
                                        {PRACTICE_QUESTIONS.map((q) => (
                                            <div key={q.id}>
                                                <SignedIn>
                                                    <Link href={`/practice/${q.id}`}>
                                                        <div className="p-4 mb-3 rounded-lg border transition-all cursor-pointer hover:bg-muted hover:border-primary/50 hover:shadow-md group">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{q.title}</h4>
                                                                <div className="flex gap-2">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                                        q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-red-100 text-red-700'
                                                                        }`}>
                                                                        {q.difficulty}
                                                                    </span>
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700">
                                                                        {q.category}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="text-muted-foreground text-xs line-clamp-2">{q.description}</p>
                                                        </div>
                                                    </Link>
                                                </SignedIn>

                                                <SignedOut>
                                                    <SignInButton mode="modal">
                                                        <div className="p-4 mb-3 rounded-lg border transition-all cursor-pointer hover:bg-muted hover:border-primary/50 hover:shadow-md group">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{q.title}</h4>
                                                                <div className="flex gap-2">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                                        q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-red-100 text-red-700'
                                                                        }`}>
                                                                        {q.difficulty}
                                                                    </span>
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700">
                                                                        {q.category}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="text-muted-foreground text-xs line-clamp-2">{q.description}</p>
                                                        </div>
                                                    </SignInButton>
                                                </SignedOut>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Call to Action Feature Card */}
                            <div className="rounded-xl overflow-hidden border shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white h-[500px] flex flex-col justify-center items-center p-8 text-center relative">
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                    <div className="absolute right-10 top-10 transform rotate-12">
                                        <Code2 className="h-40 w-40" />
                                    </div>
                                    <div className="absolute left-10 bottom-10 transform -rotate-12">
                                        <Terminal className="h-32 w-32" />
                                    </div>
                                </div>

                                <div className="relative z-10 max-w-md space-y-6">
                                    <div className="h-20 w-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-primary/30">
                                        <Laptop className="h-10 w-10 text-primary" />
                                    </div>

                                    <h3 className="text-3xl font-bold tracking-tight">
                                        Real-time Code Execution
                                    </h3>
                                    <p className="text-slate-300 text-lg leading-relaxed">
                                        Experience our advanced LeetCode-style editor.
                                        Write, run, and debug code in 4+ languages with instant feedback and test cases.
                                    </p>

                                    <div className="pt-4">
                                        <div className="pt-4">
                                            <SignedIn>
                                                <Link href="/practice">
                                                    <Button size="lg" className="h-12 px-8 text-base shadow-xl hover:scale-105 transition-transform">
                                                        Go to Practice Arena
                                                    </Button>
                                                </Link>
                                            </SignedIn>
                                            <SignedOut>
                                                <SignInButton mode="modal">
                                                    <Button size="lg" className="h-12 px-8 text-base shadow-xl hover:scale-105 transition-transform">
                                                        Go to Practice Arena
                                                    </Button>
                                                </SignInButton>
                                            </SignedOut>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="py-20 bg-muted/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Contact Info */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
                                    <p className="text-muted-foreground text-lg">
                                        Have questions or feedback? We&apos;d love to hear from you.
                                        Reach out through the form or our social channels.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Mail className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                                            <a href="mailto:deepakkumar@nitmanipur.ac.in" className="font-semibold hover:underline">
                                                deepakkumar@nitmanipur.ac.in
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Github className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">GitHub</p>
                                            <a href="https://github.com/dk2430098" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                                                github.com/dk2430098
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Linkedin className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
                                            <a href="https://www.linkedin.com/in/deepak-kumar-34921b269/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
                                                Deepak Kumar
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <Card className="p-8 bg-background">
                                {!isSuccess ? (
                                    <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Name</label>
                                            <input type="text" name="name" className="w-full p-2 border rounded-md bg-background" placeholder="Your name" required disabled={isSubmitting} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Email</label>
                                            <input type="email" name="email" className="w-full p-2 border rounded-md bg-background" placeholder="your@email.com" required disabled={isSubmitting} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Message</label>
                                            <textarea name="message" className="w-full p-2 border rounded-md bg-background h-32" placeholder="How can we help?" required disabled={isSubmitting} />
                                        </div>
                                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                                            {isSubmitting ? "Sending..." : "Send Message"}
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="text-center py-16 space-y-4">
                                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                            <CheckCircle2Icon className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-bold">Message Sent!</h3>
                                        <p className="text-muted-foreground">Thank you for reaching out. We&apos;ll get back to you shortly.</p>
                                        <Button variant="outline" onClick={() => setIsSuccess(false)}>Send Another</Button>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Enhanced Footer */}
                <footer className="bg-background border-t py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Video className="h-6 w-6 text-primary" />
                                    <span className="text-xl font-bold">IMeet</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    The complete platform for technical interview preparation and conducting.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">Product</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                                    <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                                    <li><Link href="#" className="hover:text-primary transition-colors">For Interviewers</Link></li>
                                    <li><Link href="#" className="hover:text-primary transition-colors">For Candidates</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">Resources</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                                    <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
                                    <li><Link href="#" className="hover:text-primary transition-colors">Support Center</Link></li>
                                    <li><Link href="#" className="hover:text-primary transition-colors">Community</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-4">Legal</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                                    <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                                    <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                            <p>© {new Date().getFullYear()} IMeet. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
