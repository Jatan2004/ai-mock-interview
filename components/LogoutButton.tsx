"use client";

import { useRouter } from "next/navigation";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Logout
    </Button>
  );
}


