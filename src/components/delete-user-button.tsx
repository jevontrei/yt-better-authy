"use client";

import { TrashIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { deleteUserAction } from "@/actions/delete-user-action";
import { toast } from "sonner";

interface DeleteUserButtonProps {
  userId: string;
}

// rafc shortcut
export const DeleteUserButton = ({ userId } = DeleteUserButtonProps) => {
  // why pass false here?
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);

    const { error } = await deleteUserAction({ userId });

    // hover over error -> it can be string or null
    if (error) {
      toast.error(error);
    } else {
      toast.success("User deleted successfully!");
    }

    setIsPending(false);
  }

  return (
    <Button
      size="icon"
      variant="destructive"
      className="size=7 rounded-sm"
      disabled={isPending}
      onClick={handleClick}
    >
      <span className="sr-only">Delete User</span>
      <TrashIcon />
    </Button>
  );
};

export const PlaceholderDeleteUserButton = () => {
  return (
    <Button
      size="icon"
      variant="destructive"
      className="size=7 rounded-sm"
      disabled
    >
      <span className="sr-only">Delete User</span>
      {/* where should TrashIcon be imported from? */}
      <TrashIcon />
    </Button>
  );
};
