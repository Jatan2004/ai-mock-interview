import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function DELETE(
  _request: Request,
  context: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    const doc = await db.collection("interviews").doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    if (doc.data()?.userId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await doc.ref.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete interview", error);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}


