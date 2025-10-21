import { NextResponse } from "next/server";

export async function GET() {
    const hasGithubToken = !!process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== 'your_github_token_here';
    const hasFirebaseConfig = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your_firebase_api_key_here';

    return NextResponse.json({
        status: "OK",
        environment: process.env.NODE_ENV,
        githubToken: hasGithubToken ? "✅ Configured" : "❌ Missing or using placeholder",
        firebaseConfig: hasFirebaseConfig ? "✅ Configured" : "❌ Missing or using placeholder",
        message: hasGithubToken
            ? "GitHub API should work correctly!"
            : "Please configure GITHUB_TOKEN in .env.local file"
    });
}
