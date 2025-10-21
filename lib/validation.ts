import { z } from "zod";

// GitHub username validation
export const githubUsernameSchema = z
    .string()
    .min(1, "GitHub username is required")
    .max(39, "GitHub username must be 39 characters or less")
    .regex(
        /^[a-zA-Z0-9]([a-zA-Z0-9]|-(?![.-])){0,37}[a-zA-Z0-9]$/,
        "Invalid GitHub username format"
    );

// URL validation
export const urlSchema = z.string().url("Invalid URL format");

// Social media handle validation
export const socialHandleSchema = z
    .string()
    .min(1, "Handle is required")
    .max(50, "Handle must be 50 characters or less")
    .regex(/^[a-zA-Z0-9_]+$/, "Handle can only contain letters, numbers, and underscores");

// Name validation
export const nameSchema = z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces");

// Image URL validation
export const imageUrlSchema = z
    .string()
    .url("Invalid image URL format")
    .refine(
        (url) => {
            const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
            return allowedExtensions.some((ext) => url.toLowerCase().includes(ext));
        },
        "Image URL must be a valid image format"
    );

// Open Readme image parameters validation (new name)
export const imageParamsSchema = z.object({
    n: nameSchema.optional(),
    g: githubUsernameSchema,
    x: socialHandleSchema.optional(),
    l: socialHandleSchema.optional(),
    i: imageUrlSchema.optional(),
    p: urlSchema.optional(),
    z: z.string().min(1, "Unique ID is required"),
});

export type ImageParams = z.infer<typeof imageParamsSchema>;

// Backward compatibility exports
export const bentoParamsSchema = imageParamsSchema;
export type BentoParams = ImageParams;

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
    return input
        .replace(/[<>]/g, "") // Remove potential HTML tags
        .replace(/javascript:/gi, "") // Remove javascript: protocol
        .replace(/on\w+=/gi, "") // Remove event handlers
        .trim();
}

// Validate and sanitize GitHub username
export function validateGitHubUsername(username: string): { isValid: boolean; error?: string } {
    try {
        githubUsernameSchema.parse(username);
        return { isValid: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { isValid: false, error: error.issues[0].message };
        }
        return { isValid: false, error: "Invalid username format" };
    }
}
