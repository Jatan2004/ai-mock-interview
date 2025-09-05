"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DeleteInterviewButton({ interviewId }: { interviewId: string }) {
  const router = useRouter();

  const onDelete = async () => {
    try {
      const ok = confirm("Delete this interview? This cannot be undone.");
      if (!ok) return;
      const res = await fetch(`/api/interviews/${interviewId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Button variant="destructive" onClick={onDelete}>
      Delete
    </Button>
  );
}


