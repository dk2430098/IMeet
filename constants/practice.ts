export const LANGUAGES = [
    { id: "javascript", name: "JavaScript", monacoLanguage: "javascript" },
    { id: "python", name: "Python", monacoLanguage: "python" },
    { id: "java", name: "Java", monacoLanguage: "java" },
    { id: "cpp", name: "C++", monacoLanguage: "cpp" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export const PRACTICE_QUESTIONS = [
    // DSA - Arrays
    {
        id: "two-sum",
        title: "Two Sum",
        difficulty: "Easy",
        category: "Arrays",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution.\n\nINPUT FORMAT:\n- The first line contains an integer T, the number of test cases.\n- For each test case:\n  - The first line contains an integer N, the size of the array.\n  - The second line contains N space-separated integers representing `nums`.\n  - The third line contains an integer `target`.\n\nOUTPUT FORMAT:\n- For each test case, print two space-separated integers representing the indices.\n\nCONSTRAINTS:\n- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9\n\nEXAMPLE:\nInput:\n1\n4\n2 7 11 15\n9\n\nOutput:\n0 1",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nlet currentLine = 0;\nfunction readLine() { return input[currentLine++]; }\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [
            {
                input: `1
4
2 7 11 15
9`, output: "0 1"
            },
            {
                input: `1
3
3 2 4
6`, output: "1 2"
            },
            {
                input: `1
2
3 3
6`, output: "0 1"
            }
        ]
    },
    {
        id: "reverse-string",
        title: "Reverse String",
        difficulty: "Easy",
        category: "Strings",
        description: "Write a function that reverses a string. The input string is given as an array of characters `s`. You must do this by modifying the input array in-place with O(1) extra memory.\n\nINPUT FORMAT:\n- The first line contains an integer T, the number of test cases.\n- For each test case:\n  - The first line contains a string s.\n\nOUTPUT FORMAT:\n- For each test case, print the reversed string.\n\nCONSTRAINTS:\n- 1 <= s.length <= 10^5\n- s consists of printable ASCII characters.\n\nEXAMPLE:\nInput:\n1\nhello\nOutput:\nolleh",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nlet currentLine = 0;\nfunction readLine() { return input[currentLine++]; }\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [
            {
                input: `1
hello`, output: "olleh"
            },
            {
                input: `1
Hannah`, output: "hannaH"
            }
        ]
    },

    // DSA - Logic
    {
        id: "palindrome-number",
        title: "Palindrome Number",
        difficulty: "Easy",
        category: "Math",
        description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nINPUT FORMAT:\n- The first line contains an integer T, the number of test cases.\n- For each test case, the line contains an integer x.\n\nOUTPUT FORMAT:\n- For each test case, print \"true\" if palindrome, else \"false\".\n\nCONSTRAINTS:\n- -2^31 <= x <= 2^31 - 1\n\nEXAMPLE:\nInput:\n2\n121\n10\nOutput:\ntrue\nfalse",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nlet currentLine = 0;\nfunction readLine() { return input[currentLine++]; }\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [
            {
                input: `1
121`, output: "true"
            },
            {
                input: `1
-121`, output: "false"
            },
            {
                input: `1
10`, output: "false"
            }
        ]
    },

    // System Design
    {
        id: "url-shortener",
        title: "Design a URL Shortener",
        difficulty: "Medium",
        category: "System Design",
        description: "Design a URL shortening service like TinyURL. Discuss capacity estimation, API endpoints, database schema, and handling concurrency.",
        starterCode: {
            javascript: `// Write your system design notes here\n// 1. Requirements\n// 2. Capacity Estimation\n// 3. API Design\n// 4. Database Schema`,
            python: `# Write your system design notes here\n# 1. Requirements\n# 2. Capacity Estimation\n# 3. API Design\n# 4. Database Schema`,
            java: `// Write your system design notes here\n// 1. Requirements\n// 2. Capacity Estimation\n// 3. API Design\n// 4. Database Schema`,
            cpp: `// Write your system design notes here\n// 1. Requirements\n// 2. Capacity Estimation\n// 3. API Design\n// 4. Database Schema`
        },
        testCases: []
    },
    {
        id: "rate-limiter",
        title: "Design a Rate Limiter",
        difficulty: "Hard",
        category: "System Design",
        description: "Design a rate limiter that prevents clients from making too many requests. Discuss algorithms (Token Bucket, Leaky Bucket), distributed counters, and high availability.",
        starterCode: {
            javascript: `// Design a Rate Limiter\n// Algorithms: Token Bucket, Leaky Bucket, etc.\n// Implementation details...`,
            python: `# Design a Rate Limiter\n# Algorithms: Token Bucket, Leaky Bucket, etc.\n# Implementation details...`,
            java: `// Design a Rate Limiter\n// Algorithms: Token Bucket, Leaky Bucket, etc.\n// Implementation details...`,
            cpp: `// Design a Rate Limiter\n// Algorithms: Token Bucket, Leaky Bucket, etc.\n// Implementation details...`
        },
        testCases: []
    },

    // Behavioral
    {
        id: "star-conflict",
        title: "Conflict Resolution",
        difficulty: "N/A",
        category: "Behavioral",
        description: "Tell me about a time you had a conflict with a coworker. How did you resolve it? Use the STAR method (Situation, Task, Action, Result).",
        starterCode: {
            javascript: `// Situation: \n// Task: \n// Action: \n// Result: `,
            python: `# Situation: \n# Task: \n# Action: \n# Result: `,
            java: `// Situation: \n// Task: \n// Action: \n// Result: `,
            cpp: `// Situation: \n// Task: \n// Action: \n// Result: `
        },
        testCases: []
    },
    {
        id: "star-leadership",
        title: "Leadership Example",
        difficulty: "N/A",
        category: "Behavioral",
        description: "Describe a time when you took initiative or led a project. What challenges did you face and how did you overcome them?",
        starterCode: {
            javascript: `// Situation: \n// Task: \n// Action: \n// Result: `,
            python: `# Situation: \n# Task: \n# Action: \n# Result: `,
            java: `// Situation: \n// Task: \n// Action: \n// Result: `,
            cpp: `// Situation: \n// Task: \n// Action: \n// Result: `
        },
        testCases: []
    },
    // DP
    {
        id: "climbing-stairs",
        title: "Climbing Stairs",
        difficulty: "Medium",
        category: "DP",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?\n\nINPUT FORMAT:\n- The first line contains an integer T.\n- For each test case, an integer n.\n\nOUTPUT FORMAT:\n- Print the number of distinct ways.\n\nCONSTRAINTS:\n- 1 <= n <= 45\n\nEXAMPLE:\nInput:\n2\n2\n3\nOutput:\n2\n3",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nlet currentLine = 0;\nfunction readLine() { return input[currentLine++]; }\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [
            {
                input: `1
2`, output: "2"
            },
            {
                input: `1
3`, output: "3"
            }
        ]
    },
    // Stack
    {
        id: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "Medium",
        category: "Stack",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nINPUT FORMAT:\n- The first line contains an integer T.\n- For each test case, a string s.\n\nOUTPUT FORMAT:\n- Print \"true\" or \"false\".\n\nCONSTRAINTS:\n- 1 <= s.length <= 10^4\n- s consists of parentheses only.\n\nEXAMPLE:\nInput:\n1\n()[]{}\nOutput:\ntrue",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nlet currentLine = 0;\nfunction readLine() { return input[currentLine++]; }\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Test your code here\n    return 0;\n}`
        },
        testCases: [
            {
                input: `1
()`, output: "true"
            },
            {
                input: `1
()[]{}`, output: "true"
            },
            {
                input: `1
(]`, output: "false"
            }
        ]
    },
    // More Arrays/Strings
    {
        id: "merge-sorted-array",
        title: "Merge Sorted Array",
        difficulty: "Easy",
        category: "Arrays",
        description: "You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively. Merge nums1 and nums2 into a single array sorted in non-decreasing order.\n\nINPUT FORMAT:\n- Integers m, n\n- Array nums1 (size m+n)\n- Array nums2 (size n)\n\nOUTPUT FORMAT:\n- Print the merged array space-separated.\n\nEXAMPLE:\nInput:\n1\n3 3\n1 2 3 0 0 0\n2 5 6\nOutput:\n1 2 2 3 5 6",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [{ input: `1\n3 3\n1 2 3 0 0 0\n2 5 6`, output: "1 2 2 3 5 6" }]
    },
    {
        id: "max-subarray",
        title: "Maximum Subarray",
        difficulty: "Medium",
        category: "Arrays",
        description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\nINPUT FORMAT:\n- T\n- N\n- nums\n\nOUTPUT FORMAT:\n- Max sum\n\nEXAMPLE:\nInput:\n1\n9\n-2 1 -3 4 -1 2 1 -5 4\nOutput:\n6",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [{ input: `1\n9\n-2 1 -3 4 -1 2 1 -5 4`, output: "6" }]
    },
    {
        id: "best-time-to-buy-sell-stock",
        title: "Best Time to Buy and Sell Stock",
        difficulty: "Easy",
        category: "Arrays",
        description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nINPUT FORMAT:\n- T\n- N\n- prices\n\nOUTPUT FORMAT:\n- Max profit\n\nEXAMPLE:\nInput:\n1\n6\n7 1 5 3 6 4\nOutput:\n5",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [{ input: `1\n6\n7 1 5 3 6 4`, output: "5" }]
    },
    {
        id: "valid-anagram",
        title: "Valid Anagram",
        difficulty: "Easy",
        category: "Strings",
        description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nINPUT FORMAT:\n- T\n- s\n- t\n\nOUTPUT FORMAT:\n- true/false\n\nEXAMPLE:\nInput:\n1\nanagram\nnagaram\nOutput:\ntrue",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [{ input: `1\nanagram\nnagaram`, output: "true" }]
    },
    {
        id: "longest-substring-without-repeating-characters",
        title: "Longest Substring Without Repeating",
        difficulty: "Medium",
        category: "Strings",
        description: "Given a string s, find the length of the longest substring without repeating characters.\n\nINPUT FORMAT:\n- T\n- s\n\nOUTPUT FORMAT:\n- Length\n\nEXAMPLE:\nInput:\n1\nabcabcbb\nOutput:\n3",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [{ input: `1\nabcabcbb`, output: "3" }]
    },
    // Trees/Mock
    {
        id: "invert-binary-tree",
        title: "Invert Binary Tree",
        difficulty: "Easy",
        category: "Trees",
        description: "Given the root of a binary tree, invert the tree, and return its root. (Input is level order array).\n\nINPUT FORMAT:\n- T\n- Level order array (as string line)\n\nOUTPUT FORMAT:\n- Level order array of inverted tree\n\nEXAMPLE:\nInput:\n1\n4 2 7 1 3 6 9\nOutput:\n4 7 2 9 6 3 1",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [{ input: `1\n4 2 7 1 3 6 9`, output: "4 7 2 9 6 3 1" }]
    },
    {
        id: "linked-list-cycle",
        title: "Linked List Cycle",
        difficulty: "Easy",
        category: "LinkedList",
        description: "Given head, the head of a linked list, determine if the linked list has a cycle in it.\n\nINPUT FORMAT:\n- T\n- List values\n- Pos (index of cycle tail connection)\n\nOUTPUT FORMAT:\n- true/false\n\nEXAMPLE:\nInput:\n1\n3 2 0 -4\n1\nOutput:\ntrue",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [{ input: `1\n3 2 0 -4\n1`, output: "true" }]
    },
    {
        id: "missing-number",
        title: "Missing Number",
        difficulty: "Easy",
        category: "Arrays",
        description: "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.\n\nINPUT FORMAT:\n- T\n- N\n- nums\n\nOUTPUT FORMAT:\n- Missing number\n\nEXAMPLE:\nInput:\n1\n3\n3 0 1\nOutput:\n2",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [{ input: `1\n3\n3 0 1`, output: "2" }]
    },
    {
        id: "container-with-most-water",
        title: "Container With Most Water",
        difficulty: "Medium",
        category: "Two Pointers",
        description: "You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water.\n\nINPUT FORMAT:\n- T\n- N\n- heights\n\nOUTPUT FORMAT:\n- Max area\n\nEXAMPLE:\nInput:\n1\n9\n1 8 6 2 5 4 8 3 7\nOutput:\n49",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [{ input: `1\n9\n1 8 6 2 5 4 8 3 7`, output: "49" }]
    },
    {
        id: "fibonacci-number",
        title: "Fibonacci Number",
        difficulty: "Easy",
        category: "DP",
        description: "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\n\nINPUT FORMAT:\n- T\n- n\n\nOUTPUT FORMAT:\n- F(n)\n\nEXAMPLE:\nInput:\n1\n4\nOutput:\n3",
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nfunction solve() {\n    // Write your code here\n}\n\nsolve();`,
            python: `import sys\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
            java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
            cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
        },
        testCases: [{ input: `1\n4`, output: "3" }]
    }
];



