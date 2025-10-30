import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userText,
      role = "",
      techstack = "",
      type = "",
      level = "",
      max_questions = 0,
      contextQuestions = "",
    } = body || {};

    if (!userText || typeof userText !== "string") {
      return NextResponse.json({ success: false, error: "Missing userText" }, { status: 400 });
    }

    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `You are an interview agent restricted to this topic.
Role: ${role}
Tech stack: ${techstack}
Focus type: ${type}
Seniority: ${level}
Max primary questions: ${max_questions}
Structured flow (optional):\n${contextQuestions}

Candidate says: "${userText}"

Respond concisely in one or two sentences, stay strictly on topic.
If they ask a question, answer briefly and proceed.
If max primary questions was reached already (cannot be verified here), politely conclude.
`,
    });

    return NextResponse.json({ success: true, reply: text });
  } catch (e) {
    console.error("chat-reply error", e);
    return NextResponse.json({ success: false, error: "Failed to reply" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true });
}


