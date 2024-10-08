"use client";

import * as React from "react";

import { AuthTokenResponsePassword } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { loginFormSchema } from "@/lib/schema";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { signInWithEmailAndPassword } from "../actions";

interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {}
type FormData = z.infer<typeof loginFormSchema>;

export function LoginForm({ className, ...props }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(loginFormSchema),
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await signInWithEmailAndPassword(data);
      const user: AuthTokenResponsePassword = await JSON.parse(res);

      reset();
      if (user.data.session) {
        router.push("/");
        router.refresh();
        toast({
          variant: "default",
          title: "Welcome back!.",
          description: "Login Successful",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Wrong Email or Password",
          action: <ToastAction altText="Try again">Try again</ToastAction>,
        });
      }
    } catch (error) {
      reset();
      console.log(error);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-2">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email", { required: true })}
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isSubmitting}
              />
              {errors?.email && (
                <p className="text-red-600 text-sm">{errors?.email?.message}</p>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="password">Email</Label>
              <Input
                {...register("password", { required: true })}
                id="password"
                placeholder="Password"
                type="password"
                disabled={isSubmitting}
              />
              {errors?.password && (
                <p className="text-red-600 text-sm">
                  {errors?.password?.message}
                </p>
              )}
            </div>
          </div>
          <Button className="mt-3" disabled={isSubmitting}>
            {isSubmitting && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In with Email
          </Button>
        </div>
      </form>
    </div>
  );
}
