import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Id } from "@/convex/_generated/dataModel";

interface FeedbackDialogProps {
    isOpen: boolean;
    onClose: () => void;
    interviewId: Id<"interviews">;
}

export default function FeedbackDialog({ isOpen, onClose, interviewId }: FeedbackDialogProps) {

    const comments = useQuery(api.comments.getComments, { interviewId });
    const addComment = useMutation(api.comments.addComment);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    if (comments === undefined) {
        return null; // Or loader if you prefer, but standard Dialog pattern often avoids flicker
    }

    const existingFeedback = comments[0]; // Assuming one feedback per interview for now

    const handleSubmit = async () => {
        if (!comment.trim() || rating === 0) {
            toast.error("Please provide both a rating and a comment");
            return;
        }

        setIsSubmitting(true);
        try {
            await addComment({
                interviewId,
                rating,
                content: comment,
            });
            toast.success("Feedback submitted successfully");
            onClose(); // Close on success, state will update via Convex reactivity
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Interview Feedback</DialogTitle>
                </DialogHeader>

                {existingFeedback ? (
                    // READ ONLY VIEW
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-8 w-8 ${star <= existingFeedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                            ))}
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground italic">&quot;{existingFeedback.content}&quot;</p>
                        </div>
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={onClose}>Close</Button>
                        </div>
                    </div>
                ) : (
                    // SUBMISSION FORM
                    <div className="space-y-4 py-4">
                        {/* RATING SELECTOR */}
                        <div className="flex flex-col items-center gap-2">
                            <label className="text-sm font-medium">Rate the Candidate</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-colors"
                                    >
                                        <Star
                                            className={`h-8 w-8 ${star <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* COMMENT INPUT */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Your Feedback</label>
                            <Textarea
                                placeholder="Provide constructive feedback about the candidate's performance..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                                    </>
                                ) : "Submit Feedback"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
