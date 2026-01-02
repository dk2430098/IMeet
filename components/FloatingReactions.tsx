import { useCall } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

interface Reaction {
    id: string;
    emoji: string;
    x: number;
    y: number;
}

const FloatingReactions = () => {
    const call = useCall();
    const [reactions, setReactions] = useState<Reaction[]>([]);

    useEffect(() => {
        if (!call) return;

        // Listener for new reactions
        // Stream SDK typically emits 'reaction.new' for incoming reactions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleNewReaction = (event: any) => {
            // payload might differ. usually event.reaction.emoji or event.reaction.custom.emoji
            console.log("New reaction event:", event); // Debug log (can remove later)

            const emoji = event.reaction?.emoji || event.reaction?.custom?.emoji;
            if (!emoji) return;

            const newReaction: Reaction = {
                id: crypto.randomUUID(),
                emoji,
                x: Math.random() * 80 + 10, // Random X (10-90%)
                y: 0, // Start logic handled in CSS/Component
            };

            setReactions((prev) => [...prev, newReaction]);

            // Remove after animation (3s to match CSS)
            setTimeout(() => {
                setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
            }, 3000);
        };

        // @ts-expect-error: Stream SDK type mismatch for custom event
        call.on("reaction.new", handleNewReaction);

        return () => {
            // @ts-expect-error: Stream SDK type mismatch for custom event
            call.off("reaction.new", handleNewReaction);
        };
    }, [call]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[100]" aria-hidden="true">
            {reactions.map((reaction) => (
                <div
                    key={reaction.id}
                    className="absolute text-5xl animate-float-up" // Increased size to 5xl
                    style={{
                        left: `${reaction.x}%`,
                        bottom: "20px", // Start near bottom
                    }}
                >
                    {reaction.emoji}
                </div>
            ))}
            <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          10% {
            transform: translateY(-40px) scale(1.2); // Initial popup
            opacity: 1;
          }
          100% {
            transform: translateY(-400px) scale(1.5); // Float high up
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 3s ease-out forwards; // Slower, smoother
        }
      `}</style>
        </div>
    );
};

export default FloatingReactions;
