import { useUser } from "@clerk/nextjs";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserInfo from "@/components/UserInfo";
import { Loader2Icon, XIcon, Clock, CheckCircle2, AlertCircle, CalendarIcon, ChevronsUpDown, Check, PlayIcon, TimerIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TIME_SLOTS } from "@/constants";
import MeetingCard from "@/components/MeetingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, getMeetingStatus } from "@/lib/utils";
import { format } from "date-fns";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

function InterviewScheduleUI() {
  const client = useStreamVideoClient();
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const interviews = useQuery(api.interviews.getAllInterviews) ?? [];
  const users = useQuery(api.users.getUsers) ?? [];
  const createInterview = useMutation(api.interviews.createInterview);

  const candidates = users?.filter((u) => u.role === "candidate");
  const interviewers = users?.filter((u) => u.role === "interviewer");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date(),
    time: "09:00",
    duration: "60",
    candidateId: "",
    interviewerIds: user?.id ? [user.id] : [],
  });

  const [openCandidate, setOpenCandidate] = useState(false);
  const [openInterviewer, setOpenInterviewer] = useState(false);

  const [selectedInterview, setSelectedInterview] = useState<any>(null);

  const liveInterviews = interviews?.filter((i) => getMeetingStatus(i) === "live") || [];
  const upcomingInterviews = interviews?.filter((i) => getMeetingStatus(i) === "upcoming") || [];
  const completedInterviews = interviews?.filter((i) => getMeetingStatus(i) === "completed") || [];
  const expiredInterviews = interviews?.filter((i) => getMeetingStatus(i) === "expired") || [];

  const scheduleMeeting = async () => {
    if (!client || !user) return;
    if (!formData.candidateId || formData.interviewerIds.length === 0) {
      toast.error("Please select both candidate and at least one interviewer");
      return;
    }

    setIsCreating(true);

    try {
      const { title, description, date, time, duration, candidateId, interviewerIds } = formData;
      const [hours, minutes] = time.split(":");
      const meetingDate = new Date(date);
      meetingDate.setHours(parseInt(hours), parseInt(minutes), 0);

      const durationInMs = parseInt(duration) * 60 * 1000;
      const endTime = meetingDate.getTime() + durationInMs;

      const id = crypto.randomUUID();
      const call = client.call("default", id);

      await call.getOrCreate({
        data: {
          starts_at: meetingDate.toISOString(),
          custom: {
            description: title,
            additionalDetails: description,
          },
        },
      });

      await createInterview({
        title,
        description,
        startTime: meetingDate.getTime(),
        endTime,
        status: "upcoming",
        streamCallId: id,
        candidateId,
        interviewerIds,
      });

      setOpen(false);
      toast.success("Meeting scheduled successfully!");

      setFormData({
        title: "",
        description: "",
        date: new Date(),
        time: "09:00",
        duration: "60",
        candidateId: "",
        interviewerIds: user?.id ? [user.id] : [],
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to schedule meeting. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const addInterviewer = (interviewerId: string) => {
    if (!formData.interviewerIds.includes(interviewerId)) {
      setFormData((prev) => ({
        ...prev,
        interviewerIds: [...prev.interviewerIds, interviewerId],
      }));
    }
  };

  const removeInterviewer = (interviewerId: string) => {
    if (interviewerId === user?.id) return;
    setFormData((prev) => ({
      ...prev,
      interviewerIds: prev.interviewerIds.filter((id) => id !== interviewerId),
    }));
  };

  const selectedInterviewers = interviewers.filter((i) =>
    formData.interviewerIds.includes(i.clerkId)
  );

  const availableInterviewers = interviewers.filter(
    (i) => !formData.interviewerIds.includes(i.clerkId)
  );

  const getCandidateDetails = (candidateId: string) => candidates.find(c => c.clerkId === candidateId);
  const getInterviewerDetails = (interviewerIds: string[]) => interviewers.filter(i => interviewerIds.includes(i.clerkId));


  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* HEADER INFO */}
        <div>
          <h1 className="text-3xl font-bold">Interviews</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage your sessions</p>
        </div>

        {/* DIALOG */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">Schedule Interview</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px] h-[calc(100vh-200px)] overflow-auto">
            <DialogHeader>
              <DialogTitle>Schedule Interview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* INTERVIEW TITLE */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Interview title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* INTERVIEW DESC */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Interview description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* CANDIDATE */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Candidate</label>
                <Popover open={openCandidate} onOpenChange={setOpenCandidate}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={openCandidate} className="w-full justify-between">
                      {formData.candidateId ?
                        candidates.find((candidate) => candidate.clerkId === formData.candidateId)?.name :
                        "Select candidate..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search candidate..." />
                      <CommandList>
                        <CommandEmpty>No candidate found.</CommandEmpty>
                        <CommandGroup>
                          {candidates.map((candidate) => (
                            <CommandItem
                              key={candidate.clerkId}
                              value={candidate.name}
                              onSelect={() => {
                                setFormData({ ...formData, candidateId: candidate.clerkId });
                                setOpenCandidate(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", formData.candidateId === candidate.clerkId ? "opacity-100" : "opacity-0")} />
                              <UserInfo user={candidate} />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* INTERVIEWERS */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Interviewers</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedInterviewers.map((interviewer) => (
                    <div
                      key={interviewer.clerkId}
                      className="inline-flex items-center gap-2 bg-secondary px-2 py-1 rounded-md text-sm"
                    >
                      <UserInfo user={interviewer} />
                      {interviewer.clerkId !== user?.id && (
                        <button
                          onClick={() => removeInterviewer(interviewer.clerkId)}
                          className="hover:text-destructive transition-colors"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <Popover open={openInterviewer} onOpenChange={setOpenInterviewer}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={openInterviewer} className="w-full justify-between">
                      Add interviewer...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search interviewer..." />
                      <CommandList>
                        <CommandEmpty>No interviewer found.</CommandEmpty>
                        <CommandGroup>
                          {interviewers
                            .filter((i) => !formData.interviewerIds.includes(i.clerkId))
                            .map((interviewer) => (
                              <CommandItem
                                key={interviewer.clerkId}
                                value={interviewer.name}
                                onSelect={() => {
                                  addInterviewer(interviewer.clerkId);
                                  setOpenInterviewer(false);
                                }}
                              >
                                <UserInfo user={interviewer} />
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* DATE, TIME & DURATION */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* CALENDAR */}
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" /> Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && setFormData({ ...formData, date })}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* TIME */}
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Time
                  </label>
                  <Select
                    value={formData.time}
                    onValueChange={(time) => setFormData({ ...formData, time })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* DURATION */}
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <TimerIcon className="h-4 w-4" /> Duration
                  </label>
                  <Select
                    value={formData.duration}
                    onValueChange={(duration) => setFormData({ ...formData, duration })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* MEETING SUMMARY & EXPIRATION INFO */}
              {formData.date && formData.time && (
                <div className="bg-muted/50 p-4 rounded-lg border border-border/50 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Meeting Duration: {formData.duration} Minutes</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Scheduled for <strong>{formData.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong>{formData.time}</strong>.
                  </p>
                  <div className="flex items-start gap-2 pt-1">
                    <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      The meeting link will be active for {formData.duration} minutes. It will expire at approximately <strong>
                        {(() => {
                          const [hours, minutes] = formData.time.split(":");
                          const d = new Date();
                          d.setHours(parseInt(hours), parseInt(minutes));
                          const d2 = new Date(d.getTime() + parseInt(formData.duration) * 60 * 1000);
                          return d2.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        })()}
                      </strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={scheduleMeeting} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Interview"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABS & LIST */}
      {!interviews ? (
        <div className="flex justify-center py-12">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">
              <Clock className="w-4 h-4 mr-2" />
              Upcoming ({upcomingInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="live">
              <PlayIcon className="w-4 h-4 mr-2 text-primary" />
              Live ({liveInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed ({completedInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              <AlertCircle className="w-4 h-4 mr-2" />
              Expired ({expiredInterviews.length})
            </TabsTrigger>
          </TabsList>

          {/* UPCOMING CONTENT */}
          <TabsContent value="upcoming">
            {upcomingInterviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcomingInterviews.map((interview) => (
                  <MeetingCard key={interview._id} interview={interview} onViewDetails={() => setSelectedInterview(interview)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg border-dashed">
                <p className="text-muted-foreground">No upcoming interviews</p>
              </div>
            )}
          </TabsContent>

          {/* LIVE CONTENT */}
          <TabsContent value="live">
            {liveInterviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {liveInterviews.map((interview) => (
                  <MeetingCard key={interview._id} interview={interview} onViewDetails={() => setSelectedInterview(interview)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg border-dashed">
                <p className="text-muted-foreground">No live interviews</p>
              </div>
            )}
          </TabsContent>

          {/* COMPLETED CONTENT */}
          <TabsContent value="completed">
            {completedInterviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedInterviews.map((interview) => (
                  <MeetingCard key={interview._id} interview={interview} onViewDetails={() => setSelectedInterview(interview)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg border-dashed">
                <p className="text-muted-foreground">No completed interviews yet</p>
              </div>
            )}
          </TabsContent>

          {/* EXPIRED CONTENT */}
          <TabsContent value="expired">
            {expiredInterviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {expiredInterviews.map((interview) => (
                  <MeetingCard key={interview._id} interview={interview} onViewDetails={() => setSelectedInterview(interview)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg border-dashed">
                <p className="text-muted-foreground">No expired interviews</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* MEETING DETAILS DIALOG */}
      <Dialog open={!!selectedInterview} onOpenChange={() => setSelectedInterview(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
          </DialogHeader>

          {selectedInterview && (
            <div className="space-y-6 py-4">
              {/* BASIC INFO */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{selectedInterview.title}</h3>
                  <Badge
                    variant={
                      getMeetingStatus(selectedInterview) === "live"
                        ? "default"
                        : getMeetingStatus(selectedInterview) === "upcoming"
                          ? "secondary"
                          : getMeetingStatus(selectedInterview) === "expired"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {getMeetingStatus(selectedInterview).charAt(0).toUpperCase() + getMeetingStatus(selectedInterview).slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedInterview.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(new Date(selectedInterview.startTime), "EEEE, MMMM d, yyyy")}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(new Date(selectedInterview.startTime), "h:mm a")} - {
                    selectedInterview.endTime ? format(new Date(selectedInterview.endTime), "h:mm a") : format(new Date(selectedInterview.startTime + 60 * 60 * 1000), "h:mm a")
                  }
                </div>
              </div>

              {/* PARTICIPANTS */}
              <div className="space-y-4">
                {/* CANDIDATE */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Candidate</label>
                  <div className="bg-muted/50 p-3 rounded-md">
                    {(() => {
                      const candidate = getCandidateDetails(selectedInterview.candidateId);
                      return candidate ? <UserInfo user={candidate} /> : <p className="text-sm text-muted-foreground">Unknown Candidate</p>
                    })()}
                  </div>
                </div>

                {/* INTERVIEWERS */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Interviewers</label>
                  <div className="space-y-2">
                    {getInterviewerDetails(selectedInterview.interviewerIds).map(i => (
                      <div key={i.clerkId} className="bg-muted/50 p-3 rounded-md">
                        <UserInfo user={i} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InterviewScheduleUI;