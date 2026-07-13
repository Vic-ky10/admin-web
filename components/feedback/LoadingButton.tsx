"use client";

import { ComponentProps } from "react";

import Button from "@/components/ui/Button";

interface LoadingButtonProps
  extends ComponentProps<typeof Button> {
  loading?: boolean;
}

export default function LoadingButton({
  loading,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </Button>
  );
}
