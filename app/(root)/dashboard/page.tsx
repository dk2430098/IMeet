"use client";

import ActionCard from "@/components/ActionCard";
import { QUICK_ACTIONS } from "@/constants";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import MeetingModal from "@/components/MeetingModal";
import LoaderUI from "@/components/LoaderUI";
import { Loader2Icon, CodeIcon, CalendarIcon, CheckCircle2Icon, ClockIcon } from "lucide-react";
import MeetingCard from "@/components/MeetingCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { getMeetingStatus } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";

type Interview = Doc<"interviews">;

export default function Home() {
  const router = useRouter();
  const { isInterviewer, isCandidate, isLoading } = useUserRole();

  // Queries
  const interviews = useQuery(api.interviews.getMyInterviews);
  const allInterviews = useQuery(api.interviews.getAllInterviews);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">();

  const handleQuickAction = (title: string) => {
    switch (title) {
      case "New Call":
        setModalType("start");
        setShowModal(true);
        break;
      case "Join Interview":
        setModalType("join");
        setShowModal(true);
        break;
      default:
        router.push(`/${title.toLowerCase()}`);
    }
  };

  if (isLoading) return <LoaderUI />;

  // Group Interviews
  const groupedInterviews = (interviews || []).reduce((acc, interview) => {
    const status = getMeetingStatus(interview);
    if (status === "live") acc.live.push(interview);
    else if (status === "upcoming") acc.upcoming.push(interview);
    else if (status === "completed") acc.completed.push(interview);
    else acc.expired.push(interview);
    return acc;
  }, { live: [] as Interview[], upcoming: [] as Interview[], completed: [] as Interview[], expired: [] as Interview[] });

  // Interviewer specific stats (Global view)
  const interviewerStats = (allInterviews || []).reduce((acc, interview) => {
    const status = getMeetingStatus(interview);
    if (status === "upcoming") acc.upcoming.push(interview);
    else if (status === "completed") acc.completed.push(interview);
    return acc;
  }, { upcoming: [] as Interview[], completed: [] as Interview[] });

  return (
    <div className="container max-w-7xl mx-auto p-6 md:p-8 space-y-10">

      {/* WELCOME SECTION */}
      <div className="rounded-lg bg-card p-6 border shadow-sm mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
          Welcome back!
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          {isInterviewer
            ? "Manage your interviews and review candidates effectively"
            : "Prepare for your upcoming interviews and track your progress"}
        </p>
      </div>

      {isInterviewer ? (
        <>
          {/* INTERVIEWER ACTIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_ACTIONS.map((action) => (
              <ActionCard
                key={action.title}
                action={action}
                onClick={() => handleQuickAction(action.title)}
              />
            ))}
          </div>

          <MeetingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
            isJoinMeeting={modalType === "join"}
          />

          {/* DASHBOARD STATS SECTION */}
          <section className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* UPCOMING CARD */}
              <div className="rounded-lg bg-card p-6 border shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                  <h3 className="text-2xl font-bold mt-2">{interviewerStats.upcoming.length}</h3>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <div className="h-5 w-5 border-2 border-current rounded-full" />
                </div>
              </div>

              {/* COMPLETED CARD */}
              <div className="rounded-lg bg-card p-6 border shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <h3 className="text-2xl font-bold mt-2">{interviewerStats.completed.length}</h3>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <div className="h-5 w-5 border-2 border-current rounded-full flex items-center justify-center text-[10px]">✓</div>
                </div>
              </div>

              {/* TOTAL CARD */}
              <div className="rounded-lg bg-card p-6 border shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total scheduled</p>
                  <h3 className="text-2xl font-bold mt-2">{allInterviews?.length || 0}</h3>
                </div>
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                  <div className="h-5 w-5 border-2 border-current rounded-md" />
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* CANDIDATE DASHBOARD */}

          {/* RECENT / LIVE ALERTS (Optional, maybe if Live exists show it first) */}
          {groupedInterviews.live.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
              <h2 className="text-red-400 font-semibold flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                Live Interviews
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedInterviews.live.map((interview) => (
                  <MeetingCard key={interview._id} interview={interview} />
                ))}
              </div>
            </div>
          )}

          {/* TABS FOR STATUS */}
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-6 h-auto p-1 bg-muted/50 rounded-lg">
              <TabsTrigger value="upcoming" className="py-2 px-4 rounded-md text-sm font-medium gap-2">
                <CalendarIcon className="w-4 h-4" /> Upcoming ({groupedInterviews.upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="py-2 px-4 rounded-md text-sm font-medium gap-2">
                <CheckCircle2Icon className="w-4 h-4" /> Completed ({groupedInterviews.completed.length})
              </TabsTrigger>
              <TabsTrigger value="expired" className="py-2 px-4 rounded-md text-sm font-medium gap-2">
                <ClockIcon className="w-4 h-4" /> Expired ({groupedInterviews.expired.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {groupedInterviews.upcoming.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedInterviews.upcoming.map((interview) => (
                    <MeetingCard key={interview._id} interview={interview} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                  <p className="text-muted-foreground">No upcoming interviews scheduled</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {groupedInterviews.completed.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedInterviews.completed.map((interview) => (
                    <MeetingCard key={interview._id} interview={interview} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                  <p className="text-muted-foreground">No completed interviews yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="expired">
              {groupedInterviews.expired.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedInterviews.expired.map((interview) => (
                    <MeetingCard key={interview._id} interview={interview} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                  <p className="text-muted-foreground">No expired interviews</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* PRACTICE SECTION */}
          <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/5 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-white/10 transition-colors">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start text-primary">
                <CodeIcon className="w-6 h-6" />
                <span className="font-semibold text-lg">Practice Area</span>
              </div>
              <h2 className="text-2xl font-bold">Sharpen your coding skills</h2>
              <p className="text-muted-foreground max-w-lg">
                Access our built-in code editor to practice algorithms and data structures before your actual interview.
              </p>
            </div>
            <Link href="/practice">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg animate-pulse hover:animate-none">
                Start Practicing
              </Button>
            </Link>
          </div>

        </>
      )}
    </div>
  );
}