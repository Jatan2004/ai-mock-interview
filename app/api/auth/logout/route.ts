import { NextResponse } from "next/server";
import { signOut } from "@/lib/actions/auth.action";

export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to logout" }, { status: 500 });
  }
}


