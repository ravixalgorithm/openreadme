import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type BlockProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
};

export function Block({ as: Comp = "div", className, ...props }: BlockProps) {
  const cls = [className].filter(Boolean).join(" ");
  return (
    <Comp
      {...props}
      className={cn(
        "col-span-4 rounded-lg border bg-card p-6 relative",
        cls,
      )}
    />
  );
}

// Ensure there's a default export to match existing imports like `import Block from './ui/Block'`
export default Block;
