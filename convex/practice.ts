import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { PRACTICE_QUESTIONS } from "../constants/practice";

export const getAllPracticeQuestions = query({
    handler: async (ctx) => {
        return await ctx.db.query("questions").collect();
    },
});

export const getQuestionById = query({
    args: { id: v.string() },
    handler: async (ctx, args) => {
        // Attempt to fetch by ID if it's a valid ID format, otherwise return null
        // Convex IDs are typically strings
        try {
            const question = await ctx.db.get(args.id as any);
            return question;
        } catch (e) {
            return null;
        }
    },
});

export const getProblem = action({
    args: { id: v.string() },
    handler: async (ctx, args): Promise<any> => {
        if (args.id.startsWith("cf-")) {
            // Re-fetch Codeforces logic or simpler check since we can't query API for one specific perfectly easily without parsing
            // For now, let's just re-use the getHybrid logic or simplify
            // Ideally, we just fetch the list and find it, or optimistically construct it if we had the data.
            // Let's call the hybrid list and find it. This is slightly inefficient but safe.
            const all: any[] = await ctx.runAction(api.practice.getHybridQuestions);
            return all.find((q: any) => q._id === args.id) || null;
        }

        // Internal
        return await ctx.runQuery(api.practice.getQuestionById, { id: args.id });
    }
});

export const getUserProgress = query({
    args: { userId: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.userId) return [];
        const userId = args.userId!;
        const progress = await ctx.db
            .query("user_practice")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .collect();
        return progress;
    },
});

export const saveProgress = mutation({
    args: {
        userId: v.string(),
        questionId: v.string(),
        status: v.union(v.literal("solved"), v.literal("attempted")),
        code: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("user_practice")
            .withIndex("by_user_and_question", (q) =>
                q.eq("userId", args.userId).eq("questionId", args.questionId)
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                status: args.status,
                code: args.code,
            });
        } else {
            await ctx.db.insert("user_practice", {
                userId: args.userId,
                questionId: args.questionId,
                status: args.status,
                code: args.code,
            });
        }
    },
});

export const getHybridQuestions = action({
    handler: async (ctx): Promise<any[]> => {
        // A. Fetch Internal Questions
        const internalQuestions = await ctx.runQuery(api.practice.getAllPracticeQuestions);

        // B. Fetch External Questions from Codeforces API
        let externalQuestions: any[] = [];
        try {
            // Fetch problems from multiple contests to get ~50+ questions
            // (Each contest has ~6 problems. 10 contests * 6 = 60 problems)
            const contestIds = [1926, 1923, 1922, 1921, 1920, 1919, 1918, 1917, 1916, 1915];

            const results = await Promise.all(
                contestIds.map(id =>
                    fetch(`https://codeforces.com/api/contest.standings?contestId=${id}&from=1&count=1&showUnofficial=false`)
                        .then(res => res.json())
                        .catch(err => ({ status: 'FAILED' }))
                )
            );

            externalQuestions = results.flatMap((data: any) => {
                if (data.status === 'OK' && data.result && data.result.problems) {
                    return data.result.problems.map((p: any) => ({
                        _id: `cf-${p.contestId}-${p.index}`,
                        title: `${p.index}. ${p.name}`,
                        description: `This is a problem from Codeforces Round #${p.contestId}. \n\nLink: https://codeforces.com/contest/${p.contestId}/problem/${p.index}`,
                        difficulty: p.rating ? (p.rating >= 1900 ? "Hard" : p.rating >= 1400 ? "Medium" : "Easy") : "Medium",
                        category: p.tags && p.tags.length > 0 ? p.tags[0] : "Codeforces",
                        source: "external",
                        starterCode: {
                            javascript: `// Solve ${p.name} (Codeforces ${p.contestId}${p.index})`,
                            python: `# Solve ${p.name} (Codeforces ${p.contestId}${p.index})`,
                            java: `// Solve ${p.name} (Codeforces ${p.contestId}${p.index})`,
                            cpp: `// Solve ${p.name} (Codeforces ${p.contestId}${p.index})`,
                        }
                    }));
                }
                return [];
            });

        } catch (error) {
            console.error("Failed to fetch Codeforces problems:", error);
            // Fallback to empty
        }

        // C. Merge and Return
        return [...internalQuestions, ...externalQuestions];
    },
});

export const seedQuestions = mutation({
    handler: async (ctx) => {
        const existing = await ctx.db.query("questions").collect();
        for (const q of existing) {
            await ctx.db.delete(q._id);
        }

        for (const q of PRACTICE_QUESTIONS) {
            const difficulty = (q.difficulty === "Easy" || q.difficulty === "Medium" || q.difficulty === "Hard")
                ? q.difficulty
                : "Medium";

            await ctx.db.insert("questions", {
                title: q.title,
                description: q.description,
                difficulty: difficulty,
                category: q.category,
                starterCode: q.starterCode,
                testCases: q.testCases,
                source: "internal",
            });
        }
        return { status: "success", count: PRACTICE_QUESTIONS.length };
    },
});
