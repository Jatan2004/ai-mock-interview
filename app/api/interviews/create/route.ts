import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, type, level, techstack, questions, userid, numQuestions } = body || {};

    const sessionUser = await getCurrentUser();
    const ownerUserId = sessionUser?.id ?? userid;
    if (!ownerUserId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const interview = {
      role: String(role || ""),
      type: String(type || ""),
      level: String(level || ""),
      techstack: Array.isArray(techstack)
        ? techstack
        : String(techstack || "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
      questions: Array.isArray(questions) ? questions : [],
      numQuestions: typeof numQuestions === "number" ? numQuestions : 0,
      userId: ownerUserId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);
    return NextResponse.json({ success: true, interviewId: docRef.id });
  } catch (error) {
    console.error("Failed to create interview:", error);
    return NextResponse.json({ success: false, error: "Failed to create" }, { status: 500 });
  }
}


