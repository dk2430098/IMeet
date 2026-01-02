import { useState } from "react";
import useMeetingActions from "@/hooks/useMeetingActions";
import { Doc } from "../convex/_generated/dataModel";
import { getMeetingStatus } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { CalendarIcon, Loader2, LinkIcon, CheckIcon, InfoIcon, StarIcon } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import FeedbackDialog from "./FeedbackDialog";

type Interview = Doc<"interviews">;

function MeetingCard({ interview, onViewDetails }: { interview: Interview, onViewDetails?: () => void }) {
  const { user } = useUser();
  const { joinMeeting } = useMeetingActions();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const status = getMeetingStatus(interview);
  const formattedDate = format(new Date(interview.startTime), "EEEE, MMMM d, yyyy · h:mm a");

  // Fetch comments to see if feedback is already given
  const comments = useQuery(api.comments.getComments, { interviewId: interview._id });
  const hasFeedback = comments && comments.length > 0;

  // Role Checks
  const isInterviewer = user?.id && interview.interviewerIds?.includes(user.id);

  const handleCopyLink = () => {
    const meetingLink = `${window.location.origin}/meeting/${interview.streamCallId}`;
    navigator.clipboard.writeText(meetingLink);
    setIsCopied(true);
    toast.success("Meeting link copied!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            {formattedDate}
          </div>

          <Badge
            variant={
              status === "live"
                ? "default"
                : status === "upcoming"
                  ? "secondary"
                  : status === "expired"
                    ? "destructive"
                    : "outline"
            }
          >
            {status === "live"
              ? "Live Now"
              : status === "upcoming"
                ? "Upcoming"
                : status === "expired"
                  ? "Expired"
                  : "Completed"}
          </Badge>
        </div>

        <CardTitle>{interview.title}</CardTitle>

        {interview.description && (
          <CardDescription className="line-clamp-2">{interview.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {status === "live" && (
          <div className="flex gap-2">
            <Button
              className="w-full"
              onClick={() => {
                setIsLoading(true);
                joinMeeting(interview.streamCallId);
              }}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Join Meeting"}
            </Button>
            <Button variant="outline" size="icon" onClick={() => onViewDetails?.()}>
              <InfoIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
            </Button>
          </div>
        )}

        {status === "upcoming" && (
          <div className="flex gap-2">
            <Button variant="outline" className="w-full" disabled>
              Waiting to Start
            </Button>
            {/* Always allow copying link for upcoming meetings too */}
            <Button variant="outline" size="icon" onClick={() => onViewDetails?.()}>
              <InfoIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              {isCopied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
            </Button>
          </div>
        )}

        {status === "expired" && (
          <div className="flex gap-2">
            <Button variant="outline" className="w-full" disabled>
              Expired
            </Button>
            <Button variant="outline" size="icon" onClick={() => onViewDetails?.()}>
              <InfoIcon className="w-4 h-4" />
            </Button>
          </div>
        )}

        {status === "completed" && (
          <div className="flex gap-2 items-center w-full">
            {hasFeedback ? (
              <Button variant="outline" className="flex-1" onClick={() => setShowFeedback(true)}>
                <StarIcon className="mr-2 h-4 w-4" /> View Feedback
              </Button>
            ) : (
              isInterviewer ? (
                <Button variant="outline" className="flex-1" onClick={() => setShowFeedback(true)}>
                  <StarIcon className="mr-2 h-4 w-4" /> Give Feedback
                </Button>
              ) : (
                <Button variant="outline" disabled className="flex-1 opacity-50 cursor-not-allowed">
                  <StarIcon className="mr-2 h-4 w-4" /> Pending Feedback
                </Button>
              )
            )}
            <Button variant="secondary" size="icon" onClick={() => onViewDetails?.()}>
              <InfoIcon className="w-4 h-4" />
            </Button>
          </div>
        )}

      </CardContent>

      <FeedbackDialog
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        interviewId={interview._id}
      />
    </Card>
  );
}
export default MeetingCard;