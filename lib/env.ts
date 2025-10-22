// Environment variable validation
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN is required"),
});

function validateEnv(): z.infer<typeof envSchema> {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.issues.map((err) => err.path.join(".")).join(", ");
            throw new Error(`Missing or invalid environment variables: ${missingVars}`);
        }
        throw error;
    }
}

// Validate environment variables on module load
// For development, we'll make this optional
export const env: z.infer<typeof envSchema> | Record<string, string> = (() => {
    try {
        return validateEnv();
    } catch (error) {
        console.warn("Environment validation failed, using fallback values:", error);
        // Fallback values for development
        return {
            NODE_ENV: process.env.NODE_ENV || "development",
            GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
            CHROME_EXECUTABLE_PATH: process.env.CHROME_EXECUTABLE_PATH || "",
        };
    }
})();
