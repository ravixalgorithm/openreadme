// Environment variable validation
import { z } from "zod";
import type { ZodIssue } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN is required"),
});

    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.issues.map((err: ZodIssue) => err.path.join(".")).join(", ");
            throw new Error(`Missing or invalid environment variables: ${missingVars}`);
        }
        throw error;
    }
    }
}
// Validate environment variables on module load
// For development, we'll make this optional
let env: z.infer<typeof envSchema> | Record<string, string>;
try {
try {
    env = validateEnv();
} catch (error) {
    console.warn("Environment validation failed, using fallback values:", error);
    // Fallback values for development
    env = {
        NODE_ENV: process.env.NODE_ENV || "development",
        GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
        CHROME_EXECUTABLE_PATH: process.env.CHROME_EXECUTABLE_PATH || "",
    };
}

export { env };
