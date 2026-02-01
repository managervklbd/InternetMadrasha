"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { createSafeAction } from "@/lib/safe-action";
import OpenAI from "openai";

const ChatSchema = z.object({
    question: z.string().min(1),
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

export const chatAssistant = createSafeAction(ChatSchema, async ({ question }) => {
    if (!process.env.OPENAI_API_KEY) {
        console.error("CRITICAL: OPENAI_API_KEY is missing in .env file");
        throw new Error("AI Assistant configuration is missing (API Key).");
    }
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) throw new Error("User not found");

    // 1. Search CMS (Lessons and Resources)
    const lessonMatches = await prisma.lesson.findMany({
        where: {
            OR: [
                { title: { contains: question, mode: 'insensitive' } },
                { description: { contains: question, mode: 'insensitive' } },
            ]
        },
        include: {
            resources: true,
            batch: true
        },
        take: 3
    });

    if (lessonMatches.length > 0) {
        const bestMatch = lessonMatches[0];
        let answer = `আমি আপনার প্রশ্ন সম্পর্কিত তথ্য লেসন: "${bestMatch.title}" তে পেয়েছি।\n\n`;
        if (bestMatch.description) {
            answer += `${bestMatch.description}\n\n`;
        }
        if (bestMatch.resources.length > 0) {
            answer += `সংযুক্ত রিসোর্সসমূহ: ${bestMatch.resources.map(r => r.title).join(", ")}`;
        }

        await prisma.aiLog.create({
            data: {
                userId: user.id,
                userName: session.user.name || "Unknown",
                userRole: user.role,
                question,
                answer,
                source: "CMS",
                model: "CMS_SEARCH"
            }
        });

        return { answer, source: "CMS" };
    }

    // 2. Fallback to GPT
    const systemPrompt = `You are GiNi, a School Academic Assistant designed exclusively for educational purposes.
You must respond in Bengali (বাংলা) unless requested otherwise.

STRICT RULES:
1. You may ONLY answer questions related to academic or syllabus subjects (Arabic grammar, Quran studies, Hadith, Fiqh, Math, Science, History, etc.).
2. If the user asks non-academic questions (jokes, politics, celebrities, sports, general trivia), you MUST respond with EXACTLY this message in Bengali: "দুঃখিত, আমি কেবল একাডেমিক বা সিলেবাস সম্পর্কিত প্রশ্নের উত্তর দিতে পারি। অনুগ্রহ করে আপনার বিষয় থেকে কিছু জিজ্ঞাসা করুন।"
3. Stay strictly within academic boundaries.
4. When providing mathematical or scientific formulas, you MUST use LaTeX format with delimiters:
   - Use $$ for display math (e.g., $$E = mc^2$$)
   - Use $ for inline math (e.g., $x^2$)
5. Be helpful, concise, and encourage the student to learn.`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question }
            ],
            temperature: 0.7,
            max_tokens: 800,
        });

        const aiAnswer = response.choices[0].message.content || "";
        const isRestricted = aiAnswer.includes("দুঃখিত, আমি কেবল একাডেমিক");

        await prisma.aiLog.create({
            data: {
                userId: user.id,
                userName: session.user.name || "Unknown",
                userRole: user.role,
                question,
                answer: aiAnswer,
                source: isRestricted ? "RESTRICTED" : "GPT",
                model: "gpt-4o-mini",
                tokensUsed: response.usage?.total_tokens || 0,
                isRestricted
            }
        });

        return { answer: aiAnswer, source: isRestricted ? "RESTRICTED" : "GPT" };
    } catch (error: any) {
        console.error("AI Assistant Error:", error.message || error);
        if (error.status === 401) {
            throw new Error("AI Assistant: Invalid API Key. Please check your .env file.");
        }
        throw new Error("AI Assistant is currently unavailable. Please try again later.");
    }
});
