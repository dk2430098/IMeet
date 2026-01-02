import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const joinMeeting = mutation({
    args: {
        streamCallId: v.string(),
        defaultQuestionId: v.string(),
        defaultLanguage: v.string(),
        defaultCode: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("interview_state")
            .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", args.streamCallId))
            .first();

        if (!existing) {
            await ctx.db.insert("interview_state", {
                streamCallId: args.streamCallId,
                activeQuestionId: args.defaultQuestionId,
                language: args.defaultLanguage,
                code: args.defaultCode,
            });
        }
    },
});

export const getState = query({
    args: { streamCallId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("interview_state")
            .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", args.streamCallId))
            .first();
    },
});

export const updateCode = mutation({
    args: {
        streamCallId: v.string(),
        code: v.string(),
        userId: v.optional(v.string()), // Who is typing?
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("interview_state")
            .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", args.streamCallId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                code: args.code,
                lastUpdatedBy: args.userId
            });
        }
    },
});

export const updateLanguage = mutation({
    args: {
        streamCallId: v.string(),
        language: v.string(),
        defaultCode: v.string(), // When switching, sometimes we want to set default code if empty
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("interview_state")
            .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", args.streamCallId))
            .first();

        if (existing) {
            // Logic: Update language.
            // Note: Client handles "what code to put here", so we just accept user's code via updateCode or separate call.
            // Here we just update language.
            // BUT, usually switch + code update happens together.
            await ctx.db.patch(existing._id, { language: args.language });
        }
    },
});

export const updateQuestion = mutation({
    args: {
        streamCallId: v.string(),
        questionId: v.string(),
        code: v.string(), // New starter code for the question
        language: v.string(), // Reset to default language? Or keep?
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("interview_state")
            .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", args.streamCallId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                activeQuestionId: args.questionId,
                code: args.code,
                language: args.language // Reset or update
            });
        }
    },
});
