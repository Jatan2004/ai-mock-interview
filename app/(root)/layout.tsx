import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";
import Navbar from "@/components/Navbar";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <>
      <Navbar />
      <div className="root-layout">
        {children}
      </div>
    </>
  );
};

export default Layout;
