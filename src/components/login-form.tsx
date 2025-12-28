"use client";
// "use client" runs this code in the browser

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInEmailAction } from "@/actions/sign-in-email.action";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

// why is this export const and not export default function?
// -> is not much difference... it just affects named export/import etc
export const LoginForm = () => {
  // isPending is useful because of disabled={isPending}
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    // stop the browser's default behaviour, which is to reload(?)
    evt.preventDefault();

    setIsPending(true);

    const formData = new FormData(evt.target as HTMLFormElement);

    const { error } = await signInEmailAction(formData);

    if (error) {
      toast.error(error);
      setIsPending(false);
    } else {
      toast.success("Login successful. Good to have you back.");
      router.push("/profile");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" name="email" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center gap-2">
          <Label htmlFor="password">Password</Label>
          <Link
            // forgetPassword was renamed to requestPasswordReset;  https://www.answeroverflow.com/m/1381375850582118481
            href="/auth/forgot-password"
            className="text-sm italic text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>

        <Input type="password" id="password" name="password" />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        Login
      </Button>
    </form>
  );
};
