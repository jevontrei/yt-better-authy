"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { changePasswordAction } from "@/actions/change-password-action";
import { toast } from "sonner";

// rafc
export const ChangePasswordForm = () => {
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setIsPending(true);

    const formData = new FormData(evt.target as HTMLFormElement);

    const { error } = await changePasswordAction(formData);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Password changed successfully!");
      // reset the form
      (evt.target as HTMLFormElement).reset();
    }

    setIsPending(false);
  }

  return (
    <form className="max-w-sm w-full space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input type="password" id="currentPassword" name="currentPassword" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input type="password" id="newPassword" name="newPassword" />
      </div>

      <Button type="submit" disabled={isPending}>
        Change Password
      </Button>
    </form>
  );
};
