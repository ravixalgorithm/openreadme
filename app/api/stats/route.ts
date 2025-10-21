import { NextRequest, NextResponse } from "next/server";
import fetchUserData from "@/actions/fetchUserData";
import { validateGitHubUsername } from "@/lib/validation";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
        return NextResponse.json(
            { error: "Username is required" },
            { status: 400 },
        );
    }

    const validation = validateGitHubUsername(username);
    if (!validation.isValid) {
        return NextResponse.json(
            { error: validation.error || "Invalid username format" },
            { status: 400 },
        );
    }

    try {
        const { userStats } = await fetchUserData(username);

        return NextResponse.json(
            {
                stats: userStats,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    } catch (error) {
        console.error("Error fetching user stats:", error);

        const errorMessage = error instanceof Error ? error.message : "Failed to fetch user statistics";
        const statusCode = errorMessage.includes("GitHub token") ? 401 : 500;

        return NextResponse.json(
            {
                error: errorMessage,
                ...(errorMessage.includes("GitHub token") && {
                    hint: "Please configure your GitHub token in .env.local file"
                })
            },
            { status: statusCode },
        );
    }
}
