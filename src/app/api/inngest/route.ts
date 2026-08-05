import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { functions } from "@/lib/inngest/functions";

// Create Next.js API handler for Inngest background functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
});
