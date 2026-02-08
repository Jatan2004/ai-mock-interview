"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="relative group/auth-container w-full max-w-[566px] mx-auto">
      {/* Dramatic behind-the-box glow pulse */}
      <div className="absolute inset-0 bg-primary-200/5 blur-[120px] rounded-full opacity-100 transition-opacity duration-1000 -z-10 animate-pulse" />

      <div className="glass-panel p-8 md:p-12 relative overflow-hidden animate-border-glow">
        <div className="flex flex-col gap-8 relative z-10">
          <div className="flex flex-row gap-3 justify-center items-center">
            <Image
              src="/logo.svg"
              alt="logo"
              height={32}
              width={38}
              className="logo-theme"
            />
            <h2 className="text-3xl font-black tracking-tighter uppercase elite-text-gradient">AI Interviews</h2>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl md:text-2xl font-bold text-dark-100 dark:text-white">
              {isSignIn ? "Welcome Back" : "Get Started"}
            </h3>
            <p className="text-sm text-light-600 dark:text-light-100/50 font-medium">
              Practice job interviews with <span className="text-primary-200">AI-powered</span> intelligence.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6 form"
            >
              {!isSignIn && (
                <FormField
                  control={form.control}
                  name="name"
                  label="Full Name"
                  placeholder="John Doe"
                  type="text"
                />
              )}

              <FormField
                control={form.control}
                name="email"
                label="Email Address"
                placeholder="you@example.com"
                type="email"
              />

              <FormField
                control={form.control}
                name="password"
                label="Password"
                placeholder="••••••••"
                type="password"
              />

              <Button className="btn relative group/btn overflow-hidden mx-auto flex w-fit py-6 text-sm uppercase tracking-widest font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(202,197,254,0.2)]" type="submit">
                <span className="relative z-10">{isSignIn ? "Sign In" : "Create Account"}</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-30 animate-shine" />
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-light-600 dark:text-light-100/40 font-medium">
            {isSignIn ? "No account yet?" : "Have an account already?"}
            <Link
              href={!isSignIn ? "/sign-in" : "/sign-up"}
              className="ml-2 font-bold text-primary-200 hover:text-primary-100 transition-colors underline underline-offset-4 decoration-primary-200/30"
            >
              {!isSignIn ? "Sign In" : "Sign Up"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
