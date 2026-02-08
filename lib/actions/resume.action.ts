"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { extractText } from "unpdf";
import { z } from "zod";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";

const resumeAnalysisSchema = z.object({
    atsScore: z.number().min(0).max(100),
    summary: z.string(),
    sections: z.array(z.object({
        name: z.string(),
        score: z.number(),
        feedback: z.string()
    })),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    missingKeywords: z.array(z.string()),
    formattingFeedback: z.string(),
    quantifiableAchievements: z.array(z.string()),
    finalVerdict: z.string(),
    jdMatch: z.object({
        percentage: z.number(),
        missingSkills: z.array(z.string()),
        missingKeywords: z.array(z.string()),
        recommendation: z.string(),
    }).optional(),
    optimizedBullets: z.array(z.object({
        original: z.string(),
        optimized: z.string(),
        reason: z.string(),
    })),
    radarSkills: z.object({
        technical: z.number(),
        leadership: z.number(),
        softSkills: z.number(),
        industryKnowledge: z.number(),
        communication: z.number(),
    }),
    learningPath: z.array(z.object({
        skill: z.string(),
        roadmap: z.array(z.string()),
        projectIdea: z.string()
    })),
    benchmarking: z.object({
        percentile: z.number(),
        standing: z.string(),
        comparisonPoints: z.array(z.string())
    })
});

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    try {
        const uint8Array = new Uint8Array(buffer);
        const { text } = await extractText(uint8Array);

        // Handle both string and string[] return types
        const extractedText = Array.isArray(text) ? text.join("\n") : text || "";

        return extractedText;
    } catch (error: any) {
        throw new Error(`PDF Parsing failed: ${error.message}`);
    }
}

export async function analyzeResume(formData: FormData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const file = formData.get("resume") as File;
    const jdPaste = formData.get("jd") as string || "";
    const jdFile = formData.get("jdFile") as File;

    if (!file) throw new Error("No file uploaded");

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Parse Resume PDF
        const extractedText = await extractTextFromPdf(buffer);

        let jdText = jdPaste;
        if (jdFile && jdFile.size > 0 && jdFile.type === "application/pdf") {
            const jdBytes = await jdFile.arrayBuffer();
            const jdBuffer = Buffer.from(jdBytes);
            const extractedJd = await extractTextFromPdf(jdBuffer);
            if (extractedJd) {
                jdText = extractedJd;
            }
        }

        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error("Could not extract text from PDF. Please ensure the file is not empty or protected.");
        }

        // AI Analysis
        console.log("AnalyzeResume: Sending to Gemini for analysis...");
        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: resumeAnalysisSchema,
            prompt: `
        You are an expert ATS (Applicant Tracking System) and Career Coach. 
        Your task is to analyze the following resume text and provide a comprehensive, 100% ATS-focused evaluation.
        
        Resume Text:
        ${extractedText}

        ${jdText ? `Job Description to match against:\n${jdText}\n` : ""}
        
        Evaluation Guidelines:
        1. **ATS Score**: Provide a realistic score from 0-100 based on modern ATS standards.
        2. **Keyword Mapping**: Identify if technical and soft skills are properly highlighted.
        3. **Formatting**: Flag issues like complex layouts, missing headers, or poor structure.
        4. **Impact/Quantification**: Check if the candidate uses numbers, percentages, or metrics. IMPORTANT: If no quantifiable achievements are found, you MUST provide 3 specific examples of achievements they *should* add based on their roles (e.g. "Increased sales by X%"). NEVER leave this list empty.
        5. **Missing Keywords**: Suggest 5-10 industry-specific keywords that would make this resume more visible to recruiters.
        6. **Strengths & Weaknesses**: Be constructive but direct.
        7. **Visual Radar Skills**: Score (0-100) the candidate in 5 key areas: Technical, Leadership, Soft Skills, Industry Knowledge, and Communication.
        8. **AI Bullet Optimizer**: Pick 3 "weak" or "average" sentences/bullets from the resume and provide an "AI Optimized" version for each that is more impactful and achievement-oriented.
        
        ${jdText ? `9. **JD Matching**: Since a Job Description was provided, calculate a match percentage and identify specifically what is missing in terms of skills and keywords relative to this JD.
        10. **Gap Filler (Learning Path)**: For the missing skills identified in JD matching (or general technical weaknesses if no JD), provide a 3-step learning roadmap and a project idea for each of the top 3 gaps.
        11. **Benchmarking**: Compare this candidate against the "ideal" industry standard for the target role. Provide a percentile standing (0-100) and a brief description of their levels (e.g., "Top 5% of Mid-Level candidates").` : `9. **Gap Filler**: Identify the top 3 technical weaknesses and provide a 3-step learning roadmap and a project idea for each to help them level up.
        10. **Benchmarking**: Compare this candidate against general industry standards for their current level. Provide a percentile standing and standing description.`}
        
        Output the result strictly according to the provided schema.
      `
        });
        const resumeData = {
            userId: user.id,
            fileName: file.name,
            extractedText: extractedText.substring(0, 5000), // Limit storage for long resumes
            atsScore: object.atsScore,
            analysis: object,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection("resumes").add(resumeData);

        return { success: true, analysis: object, resumeId: docRef.id };
    } catch (error: any) {
        console.error("Error analyzing resume:", error);
        return { success: false, error: error.message || "Failed to analyze resume" };
    }
}

export async function getResumesByUserId(userId: string) {
    const resumes = await db
        .collection("resumes")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

    return resumes.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
    }));
}

export async function getResumeById(id: string) {
    const doc = await db.collection("resumes").doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

export async function generateCoverLetter(resumeText: string, jdText: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        console.log("GenerateCoverLetter: Sending to Gemini...");
        const { object } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                coverLetter: z.string()
            }),
            prompt: `
                You are a top-tier Career Consultant and Copywriter. Write a high-impact, tailored cover letter.
                
                Resume Context (Extract achievements to showcase value):
                ${resumeText}
                
                Job Description Context (Extract requirements to show alignment):
                ${jdText}
                
                Strategy:
                1. Match the professionalism and culture hinted at in the JD.
                2. Explicitly link resume achievements to the JD's specific problems.
                3. Structure: 
                   - Header (Placeholders: [NAME], [CONTACT])
                   - Hook (Why this role/company?)
                   - Value Prop (Direct alignment of skills)
                   - Evidence (The metrics/impact)
                   - CTA & Sign-off
                4. Tone: Persuasive, confident, and professional. NO placeholders like [Company Name] except for user info.
            `
        });

        return { success: true, coverLetter: object.coverLetter };
    } catch (error: any) {
        console.error("Error generating cover letter:", error);
        return { success: false, error: error.message || "Failed to generate cover letter" };
    }
}
