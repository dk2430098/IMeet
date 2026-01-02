import { CallRecording } from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";
import { useState } from "react";
import { format } from "date-fns";
import { calculateRecordingDuration } from "@/lib/utils";
import { Card, CardFooter, CardHeader } from "./ui/card";
import { CalendarIcon, PlayIcon, Share2Icon, LoaderIcon, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

function RecordingCard({ recording }: { recording: CallRecording }) {
  const [isChecking, setIsChecking] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Stream recordings might take time to process. If URL is missing, it's likely processing.
  const isValidUrl = recording.url && recording.url.startsWith("http");

  const formattedStartTime = recording.start_time
    ? format(new Date(recording.start_time), "MMM d, yyyy, hh:mm a")
    : "Unknown";

  const duration =
    recording.start_time && recording.end_time
      ? calculateRecordingDuration(recording.start_time, recording.end_time)
      : "Unknown duration";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(recording.url);
      toast.success("Recording link copied to clipboard");
    } catch {
      toast.error("Failed to copy link to clipboard");
    }
  };

  const handlePlay = async () => {
    if (isExpired || !isValidUrl) return;

    setIsChecking(true);
    try {
      // Use server-side proxy to check if file exists (avoids CORS issues masking 404s)
      const response = await fetch(`/api/check-recording?url=${encodeURIComponent(recording.url)}`);

      if (response.ok) {
        window.open(recording.url, "_blank");
      } else {
        setIsExpired(true);
        toast.error("Recording has expired or been deleted");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Could not verify recording availability");
    } finally {
      setIsChecking(false);
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Interview Recording",
          text: "Check out this interview recording",
          url: recording.url
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      handleCopyLink();
    }
  }

  // RENDER PROCESSING STATE
  if (!isValidUrl) {
    return (
      <Card className="group border-none bg-card/80 backdrop-blur-sm shadow-md overflow-hidden ring-1 ring-white/5 opacity-70">
        <div className="w-full aspect-video bg-muted/50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Processing...</span>
          </div>
        </div>
        <CardHeader className="space-y-1 p-4 pb-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-lg line-clamp-1">Interview Recording</h3>
            <div className="flex items-center text-xs text-muted-foreground gap-2">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{formattedStartTime}</span>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="p-4 pt-2 gap-2">
          <Button className="flex-1" disabled>
            <LoaderIcon className="size-4 animate-spin mr-2" /> Processing
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // RENDER EXPIRED STATE
  if (isExpired) {
    return (
      <Card className="group border-none bg-card/80 backdrop-blur-sm shadow-md overflow-hidden ring-1 ring-white/5 opacity-50 grayscale">
        <div className="w-full aspect-video bg-muted/50 flex items-center justify-center cursor-not-allowed">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <AlertTriangle className="size-8" />
            <span className="text-sm font-medium">Expired / Deleted</span>
          </div>
        </div>
        <CardHeader className="space-y-1 p-4 pb-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-lg line-clamp-1 text-muted-foreground">Interview Recording</h3>
            <div className="flex items-center text-xs text-muted-foreground gap-2">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{formattedStartTime}</span>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="p-4 pt-2 gap-2">
          <Button className="flex-1" variant="ghost" disabled>
            Not Available
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // RENDER ACTIVE STATE
  return (
    <Card className="group hover:shadow-xl transition-all border-none bg-card/80 backdrop-blur-sm shadow-md overflow-hidden ring-1 ring-white/5">
      {/* THUMBNAIL AREA */}
      <div
        className="relative w-full aspect-video bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center cursor-pointer overflow-hidden group/thumb"
        onClick={handlePlay}
      >
        <div className="absolute inset-0 bg-black/10 transition-colors group-hover/thumb:bg-black/30" />

        <div className="relative size-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-transform group-hover/thumb:scale-110 border border-white/20 shadow-lg">
          {isChecking ? (
            <LoaderIcon className="size-8 animate-spin text-white" />
          ) : (
            <PlayIcon className="size-8 text-white fill-white" />
          )}
        </div>

        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">
          {duration}
        </div>
      </div>

      <CardHeader className="space-y-1 p-4 pb-2">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-lg line-clamp-1">Interview Recording</h3>
          <div className="flex items-center text-xs text-muted-foreground gap-2">
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>{formattedStartTime}</span>
          </div>
        </div>
      </CardHeader>

      <CardFooter className="p-4 pt-2 gap-2">
        <Button
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
          onClick={handlePlay}
          disabled={isChecking}
        >
          {isChecking ? <LoaderIcon className="size-4 animate-spin mr-2" /> : <PlayIcon className="size-4 mr-2" />}
          {isChecking ? "Verifying..." : "Play"}
        </Button>
        <Button variant="secondary" size="icon" onClick={handleShare} title="Share Recording">
          <Share2Icon className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
export default RecordingCard;