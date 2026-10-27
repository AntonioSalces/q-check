import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none placeholder:text-muted/70 focus-visible:border-moss focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm leading-relaxed text-ink outline-none placeholder:text-muted/70 focus-visible:border-moss focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss",
        className,
      )}
      {...props}
    />
  );
}
