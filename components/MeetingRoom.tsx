import {
  CallingState,
  CallParticipantsList,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import { LayoutListIcon, LoaderIcon, UsersIcon, ChevronLeft, ChevronRight, MaximizeIcon, CodeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

import CodeEditor from "./CodeEditor";
import { cn } from "@/lib/utils";
import MeetingControls from "./MeetingControls"; // Custom Controls
import FloatingReactions from "./FloatingReactions";

function MeetingRoom() {
  const router = useRouter();
  const call = useCall();
  const [layout, setLayout] = useState<"grid" | "speaker">("speaker");
  const [showParticipants, setShowParticipants] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // HOOKS
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const [layoutMode, setLayoutMode] = useState<"code" | "video">("code"); // "code" = Code Editor Main, "video" = Video Stream Main

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoaderIcon className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem-1px)] relative">
      {/* 
        LAYOUT LOGIC:
        - If "code": CodeEditor is BG, Video is Sidebar.
        - If "video": Video is BG, CodeEditor is Sidebar (or hidden/minimized).
      */}

      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        {layoutMode === "code" ? (
          <CodeEditor />
        ) : (
          <div className="h-full w-full bg-black">
            {layout === "grid" ? <PaginatedGridLayout /> : <SpeakerLayout />}
            <FloatingReactions />
          </div>
        )}
      </div>

      {layoutMode === "code" && <FloatingReactions />}

      {/* COLLAPSIBLE SIDEBAR TOGGLE */}
      {layoutMode === "code" && (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-50 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>

          <div
            className={cn(
              "absolute left-0 top-0 h-full w-full md:w-[35%] md:min-w-[350px] max-w-full md:max-w-[600px] z-40 transition-transform duration-300 ease-in-out border-r shadow-2xl bg-background/95 backdrop-blur-md",
              !isSidebarOpen && "-translate-x-full"
            )}
          >
            <div className="relative h-full flex flex-col">
              <div className="flex-1 overflow-hidden relative rounded-br-xl">
                {layout === "grid" ? <PaginatedGridLayout /> : <SpeakerLayout />}
                {showParticipants && (
                  <div className="absolute inset-0 bg-background/90 backdrop-blur z-50">
                    <CallParticipantsList onClose={() => setShowParticipants(false)} />
                  </div>
                )}
              </div>
              <div className="p-4 border-t bg-muted/20">
                {/* We will duplicate controls here for sidebar */}
                <div className="flex flex-col items-center gap-3">
                  <MeetingControls onLeave={() => router.push("/")} />
                  <div className="flex items-center gap-2 justify-center w-full">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="size-8">
                          <LayoutListIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setLayout("grid")}>Grid View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLayout("speaker")}>Speaker View</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" size="icon" className="size-8" onClick={() => setShowParticipants(!showParticipants)}>
                      <UsersIcon className="size-4" />
                    </Button>

                    {/* MODE TOGGLE */}
                    <Button variant="outline" size="icon" className="size-8 bg-black text-white hover:bg-zinc-800 hover:text-white" onClick={() => setLayoutMode("video")}>
                      <MaximizeIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIDEO MODE OVERLAYS */}
      {layoutMode === "video" && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/80 backdrop-blur p-4 rounded-xl border shadow-xl z-50 w-[90%] md:w-auto max-w-[90%] flex-wrap justify-center">
          <MeetingControls onLeave={() => router.push("/")} />
          <div className="h-8 w-px bg-white/20" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="size-8">
                <LayoutListIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLayout("grid")}>Grid View</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLayout("speaker")}>Speaker View</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="icon" className="size-8" onClick={() => setShowParticipants(!showParticipants)}>
            <UsersIcon className="size-4" />
          </Button>

          <Button variant="outline" size="icon" className="size-8 bg-blue-600 text-white hover:bg-blue-700 hover:text-white" onClick={() => setLayoutMode("code")}>
            <CodeIcon className="size-4" />
          </Button>
        </div>
      )}

      {/* PARTICIPANTS FOR VIDEO MODE */}
      {layoutMode === "video" && showParticipants && (
        <div className="absolute right-0 top-0 h-full w-[300px] bg-background/95 backdrop-blur border-l z-50">
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      )}

    </div>
  );
}
export default MeetingRoom;