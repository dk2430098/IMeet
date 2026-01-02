import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    role: v.union(v.literal("candidate"), v.literal("interviewer")),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  interviews: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  })
    .index("by_candidate_id", ["candidateId"])
    .index("by_stream_call_id", ["streamCallId"]),

  comments: defineTable({
    content: v.string(),
    rating: v.number(),
    interviewerId: v.string(),
    interviewId: v.id("interviews"),
  }).index("by_interview_id", ["interviewId"]),

  user_practice: defineTable({
    userId: v.string(),
    questionId: v.string(),
    status: v.union(v.literal("solved"), v.literal("attempted")),
    code: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_question", ["userId", "questionId"]),

  questions: defineTable({
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard")),
    category: v.string(),
    starterCode: v.object({
      javascript: v.string(),
      python: v.string(),
      java: v.string(),
      cpp: v.string(),
    }),
    testCases: v.optional(v.array(v.object({
      input: v.string(),
      output: v.string(),
    }))),
    source: v.literal("internal"),
  }).index("by_category", ["category"]),

  interview_state: defineTable({
    streamCallId: v.string(),
    code: v.string(),
    language: v.string(),
    activeQuestionId: v.string(),
    lastUpdatedBy: v.optional(v.string()), // Added for optimistic UI
  }).index("by_stream_call_id", ["streamCallId"]),
});