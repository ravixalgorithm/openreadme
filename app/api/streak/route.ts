import { fetchContributions } from "@/actions/githubGraphql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
        return NextResponse.json(
            { error: "Username is required" },
            { status: 400 },
        );
    }

    try {
        const stats = await fetchContributions(username);
        return NextResponse.json({ stats });
    } catch (error) {
        console.error("Error fetching streak data:", error);
        return NextResponse.json(
            { error: "Failed to fetch streak statistics" },
            { status: 500 },
        );
    }
}