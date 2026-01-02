import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { PRACTICE_QUESTIONS } from "../constants/practice";

// 1. Action to fetch hybrid questions (Internal + External)
export const getHybridQuestions = action({
    handler: async (ctx): Promise<any[]> => {
        // A. Fetch Internal Questions
        const internalQuestions = await ctx.runQuery(api.practice.getAllPracticeQuestions);

        // B. Mock Fetch External Questions (Simulating Judge0/CodeWars)
        // In a real app, this would be: const res = await fetch('https://api.judge0.com/problems');
        const externalQuestions = [
            {
                _id: "ext-1",
                title: "External: Median of Two Sorted Arrays",
                description: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
                difficulty: "Hard",
                category: "Arrays",
                source: "external",
                starterCode: {
                    javascript: "// Solve Median of Two Sorted Arrays",
                    python: "# Solve Median of Two Sorted Arrays",
                    java: "// Solve Median of Two Sorted Arrays",
                    cpp: "// Solve Median of Two Sorted Arrays",
                }
            },
            {
                _id: "ext-2",
                title: "External: Trapping Rain Water",
                description: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
                difficulty: "Hard",
                category: "DP",
                source: "external",
                starterCode: {
                    javascript: "// Solve Trapping Rain Water",
                    python: "# Solve Trapping Rain Water",
                    java: "// Solve Trapping Rain Water",
                    cpp: "// Solve Trapping Rain Water",
                }
            }
        ];

        // C. Merge and Return
        return [...internalQuestions, ...externalQuestions];
    },
});

// 3. One-time Seed Mutation
export const seedQuestions = mutation({
    handler: async (ctx) => {
        const existing = await ctx.db.query("questions").collect();
        if (existing.length > 0) return { status: "already_seeded" };

        for (const q of PRACTICE_QUESTIONS) {
            // Skip N/A difficulty items or map them, ensure strict typing
            const difficulty = (q.difficulty === "Easy" || q.difficulty === "Medium" || q.difficulty === "Hard")
                ? q.difficulty
                : "Medium"; // Default fallback

            await ctx.db.insert("questions", {
                title: q.title,
                description: q.description,
                difficulty: difficulty,
                category: q.category,
                starterCode: q.starterCode,
                source: "internal",
            });
        }

        return { status: "success", count: PRACTICE_QUESTIONS.length };
    },
});
