import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { Mic, MicOff, MonitorUp, PhoneOff, Video, VideoOff, Disc, Smile, LogOutIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

function MeetingControls({ onLeave }: { onLeave: () => void }) {
    const call = useCall();
    const router = useRouter();
    const { useMicrophoneState, useCameraState, useScreenShareState } = useCallStateHooks();

    const { isEnabled: isMicOn } = useMicrophoneState();
    const { isEnabled: isCamOn } = useCameraState();
    const { isEnabled: isScreenShareOn } = useScreenShareState();

    return (
        <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* MIC */}
            <Button
                onClick={() => call?.microphone.toggle()}
                variant={isMicOn ? "secondary" : "destructive"}
                size="icon"
                className="rounded-full size-10"
            >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            {/* CAMERA */}
            <Button
                onClick={() => call?.camera.toggle()}
                variant={isCamOn ? "secondary" : "destructive"}
                size="icon"
                className="rounded-full size-10"
            >
                {isCamOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            {/* SCREEN SHARE */}
            <Button
                onClick={() => call?.screenShare.toggle()}
                variant={isScreenShareOn ? "secondary" : "outline"}
                size="icon"
                className="rounded-full size-10"
            >
                <MonitorUp className="h-5 w-5" />
            </Button>

            {/* RECORDING */}
            <Button
                onClick={async () => {
                    try {
                        const recording = call?.state.recording;
                        if (recording) {
                            await call?.stopRecording();
                            toast.success("Recording stopped");
                        } else {
                            await call?.startRecording();
                            toast.success("Recording started");
                        }
                    } catch (e: any) {
                        console.error("Recording error:", e);
                        toast.error(e?.message || "Failed to toggle recording");
                    }
                }}
                variant={call?.state.recording ? "destructive" : "secondary"}
                size="icon"
                className="rounded-full size-10"
            >
                <Disc className="h-5 w-5" />
            </Button>

            {/* REACTIONS */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full size-10">
                        <Smile className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" side="top" className="flex gap-2 p-2">
                    {[
                        { emoji: "👍", label: "Thumbs Up" },
                        { emoji: "❤️", label: "Love" },
                        { emoji: "👏", label: "Clap" },
                        { emoji: "😂", label: "Laugh" },
                        { emoji: "🎉", label: "Celebrate" }
                    ].map((reaction) => (
                        <button
                            key={reaction.label}
                            onClick={() => {
                                call?.sendReaction({
                                    type: "reaction",
                                    custom: { emoji: reaction.emoji }
                                });
                            }}
                            className="text-2xl hover:scale-125 transition-transform"
                        >
                            {reaction.emoji}
                        </button>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* END CALL / LEAVE CONTROL */}
            <EndCallControl />
        </div>
    );
}

const EndCallControl = () => {
    const call = useCall();
    const { useLocalParticipant } = useCallStateHooks();
    const localParticipant = useLocalParticipant();
    const router = useRouter();

    const interview = useQuery(api.interviews.getInterviewByStreamCallId, {
        streamCallId: call?.id || "",
    });

    const updateInterviewStatus = useMutation(api.interviews.updateInterviewStatus);

    if (!call) return null;

    const isMeetingOwner = localParticipant?.userId === call.state.createdBy?.id;

    const navToHome = () => router.push("/");

    const endCall = async () => {
        if (!interview) return;
        try {
            await call.endCall();
            await updateInterviewStatus({
                id: interview._id,
                status: "completed",
            });
            navToHome();
            toast.success("Meeting ended for everyone");
        } catch (error) {
            console.log(error);
            toast.error("Failed to end meeting");
        }
    };

    const leaveCall = async () => {
        try {
            await call.leave();
            navToHome();
            toast.success("You left the meeting");
        } catch (error) {
            console.log(error);
            toast.error("Failed to leave meeting");
        }
    }

    if (!isMeetingOwner || !interview) {
        return (
            <Button onClick={leaveCall} variant="destructive" size="icon" className="rounded-full size-10">
                <PhoneOff className="h-5 w-5" />
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="destructive" size="icon" className="rounded-full size-10">
                    <PhoneOff className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={leaveCall} className="cursor-pointer text-destructive">
                    <LogOutIcon className="mr-2 h-4 w-4" /> Leave Meeting
                </DropdownMenuItem>
                <DropdownMenuItem onClick={endCall} className="cursor-pointer text-destructive font-semibold">
                    <PhoneOff className="mr-2 h-4 w-4" /> End Meeting for All
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default MeetingControls;
