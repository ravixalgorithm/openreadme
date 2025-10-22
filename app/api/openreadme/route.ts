/* eslint-disable @typescript-eslint/no-explicit-any */
import fetchUserData from "@/actions/fetchUserData";
import { fetchContributions } from "@/actions/githubGraphql";
import { NextRequest, NextResponse } from "next/server"
import { generateContributionGraph } from "@/utils/generate-graph";
import { fetchYearContributions } from "@/actions/fetchYearContribution";
import { rateLimit } from "@/lib/rate-limit";
import crypto from 'crypto';

export const maxDuration = 45;

// Security functions
function hashUsername(username: string): string {
    return crypto.createHash('sha256').update(username.toLowerCase()).digest('hex').substring(0, 12);
}

function generateSecureFileName(username: string, uniqueId: string): string {
    const hashedUsername = hashUsername(username);
    const timestamp = Date.now();
    const randomSuffix = crypto.createHash('md5').update(`${uniqueId}-${timestamp}`).digest('hex').substring(0, 8);
    return `profiles/${hashedUsername}-${randomSuffix}.png`;
}

// Function to log usage statistics (best-effort, non-blocking)
async function logUserGeneration(username: string, githubToken: string): Promise<void> {
    try {
        const statsFile = 'stats/usage-log.json';

        // Get existing stats
        let existingStats: any[] = [];
        let currentSha = '';

        try {
            const response = await fetch(
                `https://api.github.com/repos/ravixalgorithm/openreadme-images/contents/${statsFile}`,
                {
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                existingStats = JSON.parse(Buffer.from(data.content, 'base64').toString());
                currentSha = data.sha;
            }
        } catch (e) {
            console.log('Stats file does not exist yet, creating new one');
        }

        const newEntry = {
            hashedUsername: hashUsername(username),
            actualUsername: username,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };

        existingStats.push(newEntry);

        // Keep only last 1000 entries
        if (existingStats.length > 1000) {
            existingStats = existingStats.slice(-1000);
        }

        // Update stats file
        const updatedContent = Buffer.from(JSON.stringify(existingStats, null, 2)).toString('base64');

        const updatePayload: any = {
            message: `Update usage stats - ${existingStats.length} total generations`,
            content: updatedContent,
            branch: 'main'
        };

        if (currentSha) {
            updatePayload.sha = currentSha;
        }

        await fetch(
            `https://api.github.com/repos/ravixalgorithm/openreadme-images/contents/${statsFile}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload),
            }
        );

        console.log(`✅ Logged usage for ${username}`);
    } catch (error) {
        console.log('📊 Stats logging failed (non-critical):', error);
    }
}

// Secure GitHub upload function
async function uploadToGitHubSafely(
    imageBuffer: Buffer,
    githubToken: string,
    username: string,
    uniqueId: string
): Promise<string> {
    const fileName = generateSecureFileName(username, uniqueId);
    const base64Image = imageBuffer.toString('base64');

    // Validate image size (max 2MB)
    if (imageBuffer.length > 2 * 1024 * 1024) {
        throw new Error('Image too large (max 2MB)');
    }

    console.log(`📊 Logging usage for ${username}...`);
    await logUserGeneration(username, githubToken);

    // Clean up old files for this user
    try {
        const hashedUsername = hashUsername(username);
        const existingFilesResponse = await fetch(
            `https://api.github.com/repos/ravixalgorithm/openreadme-images/contents/profiles`,
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            }
        );

        if (existingFilesResponse.ok) {
            const files = await existingFilesResponse.json();
            const userFiles = files.filter((file: any) =>
                file.name.startsWith(`${hashedUsername}-`) && file.name.endsWith('.png')
            );

            // Delete old files for this user (keep repo clean)
            for (const file of userFiles) {
                try {
                    await fetch(
                        `https://api.github.com/repos/ravixalgorithm/openreadme-images/contents/${file.path}`,
                        {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `token ${githubToken}`,
                                'Accept': 'application/vnd.github.v3+json',
                            },
                            body: JSON.stringify({
                                message: `🧹 Cleanup: Replace old image for user`,
                                sha: file.sha,
                            }),
                        }
                    );
                    console.log(`🗑️ Deleted old file: ${file.name}`);
                } catch (deleteError) {
                    console.log(`⚠️ Could not delete old file ${file.path}`, deleteError);
                }
            }
        }
    } catch (cleanupError) {
        console.log('🧹 Cleanup failed (non-critical):', cleanupError);
    }

    // Upload new file
    console.log(`📤 Uploading new image: ${fileName}`);
    const uploadResponse = await fetch(
        `https://api.github.com/repos/ravixalgorithm/openreadme-images/contents/${fileName}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `✨ Add profile image for user ${new Date().toISOString()}`,
                content: base64Image,
                branch: 'main'
            }),
        }
    );

    if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(`GitHub upload failed: ${errorData.message || uploadResponse.statusText}`);
    }

    // Return the raw GitHub URL
    const githubUrl = `https://raw.githubusercontent.com/ravixalgorithm/openreadme-images/main/${fileName}`;
    console.log(`✅ Successfully uploaded to: ${githubUrl}`);
    return githubUrl;
}

const isValidGitHubUsername = (u: string) =>
  /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(u)

function extractUsername(req: NextRequest, body?: any) {
  const sp = req.nextUrl?.searchParams
  const u =
    sp?.get("username") ??
    sp?.get("userName") ??
    sp?.get("user") ??
    sp?.get("u") ??
    sp?.get("github") ??
    sp?.get("gh") ??
    sp?.get("login") ??
    (body && (body.username ?? body.userName ?? body.user ?? body.u ?? body.github ?? body.gh ?? body.login))
  return typeof u === "string" ? u.trim() : ""
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const username = extractUsername(req, body)
    if (!isValidGitHubUsername(username)) {
      return NextResponse.json(
        { error: "Valid GitHub username is required (2-39 characters)" },
        { status: 400 }
      )
    }

    // Enhanced rate limiting for public safety
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = rateLimit(clientIP, {
        windowMs: 10 * 60 * 1000, // 10 minutes
        maxRequests: 3 // Only 3 requests per 10 minutes per IP
    });

    if (!rateLimitResult.allowed) {
        return new NextResponse(
            JSON.stringify({
                error: "Rate limit exceeded",
                message: "Too many requests. Please wait before generating another image.",
                retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            }),
            {
                status: 429,
                headers: { "Content-Type": "application/json" }
            }
        );
    }

    const { searchParams } = new URL(req.url);
    const n = decodeURIComponent(searchParams.get("n") || "").trim();
    const g = decodeURIComponent(searchParams.get("g") || username).trim(); // prefer query g or extracted username
    const i = decodeURIComponent(searchParams.get("i") || "").trim();
    const x = decodeURIComponent(searchParams.get("x") || "").trim();
    const l = decodeURIComponent(searchParams.get("l") || "").trim();
    const p = decodeURIComponent(searchParams.get("p") || "").trim();
    const uniqueId = decodeURIComponent(searchParams.get("z") || "");

    // Validate image URL if provided
    if (i && !i.startsWith('https://')) {
        return new NextResponse(
            JSON.stringify({ error: "Image URL must use HTTPS" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    console.log(`[${new Date().toISOString()}] 🎨 Generating image for user: ${g}`);

    // Fetch GitHub data
    let userStats: any = {};
    let contributionStats: any = {};
    let graphSVG = "";

    if (g) {
        try {
            const currentYear = new Date().getFullYear();
            const contributionDays = await fetchYearContributions(g, currentYear);
            graphSVG = generateContributionGraph(contributionDays);
            const userData = await fetchUserData(g);
            userStats = userData.userStats;
            contributionStats = await fetchContributions(g);
        } catch (error) {
            console.error("❌ Error fetching GitHub data:", error);
            userStats = {};
            contributionStats = {};
        }
    }

    // Minimal HTML template
    /* stylelint-disable */
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Profile Image</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
<style>
  body{font-family: 'Space Grotesk', sans-serif;margin:0;padding:20px;background:#0f1724;color:#fff}
  .container{width:1160px;max-width:100%;margin:0 auto}
  .profile{display:flex;gap:20px;align-items:center}
  .profile img{border-radius:12px;width:200px;height:200px;object-fit:cover}
  .contribution-graph{max-width:100%;overflow:visible;margin-top:20px}
</style>
</head>
<body>
  <div class="container">
    <div class="profile">
      ${i ? `<img src="${i}" alt="profile" />` : `<div style="width:200px;height:200px;border-radius:12px;background:#1f2937;display:flex;align-items:center;justify-content:center">No Image</div>`}
      <div>
        <h1 style="margin:0;font-size:36px">${n || "Your Name"}</h1>
        <p style="margin:6px 0;color:#9ca3af">@${g || "username"}</p>
        <p style="margin:0;color:#9ca3af">${userStats.Bio || ""}</p>
      </div>
    </div>
    <div class="contribution-graph">
      ${graphSVG}
    </div>
  </div>
</body>
</html>`;
    /* stylelint-enable */

    if (!process.env.GITHUB_TOKEN) {
        throw new Error("GitHub token not configured");
    }

    // Launch browser and capture screenshot
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = !!process.env.VERCEL;

    let browser: any;
    if (isVercel || isProduction) {
        const chromium = await import('@sparticuz/chromium');
        const puppeteerCore = await import('puppeteer-core');
        browser = await puppeteerCore.default.launch({
            args: chromium.default.args,
            defaultViewport: { width: 1200, height: 1600 },
            executablePath: await chromium.default.executablePath(),
            headless: true,
        });
    } else {
        const puppeteerLocal = await import('puppeteer');
        browser = await puppeteerLocal.default.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ],
            defaultViewport: { width: 1200, height: 1600 },
            headless: true,
        });
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 1.5 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const screenshot = await page.screenshot({ type: "png", fullPage: true }) as Buffer;
    await browser.close();

    // Upload to GitHub
    try {
        const imageUrl = await uploadToGitHubSafely(screenshot, process.env.GITHUB_TOKEN, g, uniqueId);
        return new NextResponse(JSON.stringify({
            url: imageUrl,
            method: "github",
            message: "Image uploaded to GitHub successfully",
            timestamp: new Date().toISOString(),
            user: g
        }), {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (uploadError: any) {
        console.error("❌ GitHub upload failed:", uploadError);
        const base64 = screenshot.toString('base64');
        return new NextResponse(JSON.stringify({
            url: `data:image/png;base64,${base64}`,
            method: "base64_fallback",
            message: "GitHub upload failed, using base64 fallback",
            warning: "Base64 images may not display properly in GitHub README",
            error: uploadError instanceof Error ? uploadError.message : String(uploadError)
        }), {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=300",
            },
        });
    }
  } catch (error: any) {
    console.error("💥 Image generation error:", error);
    return new NextResponse(JSON.stringify({
        error: "Failed to generate image",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
    });
  }
}

const githubToken = process.env.GITHUB_TOKEN_IMAGES

function ghHeaders() {
  return {
    Authorization: `token ${githubToken}`,
    Accept: 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function assertToken() {
  if (!githubToken) {
    throw new Error('Missing GITHUB_TOKEN_IMAGES env var in Vercel')
  }
}

export async function GET(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const username = extractUsername(req, body)
    if (!isValidGitHubUsername(username)) {
      return NextResponse.json(
        { error: "Valid GitHub username is required (2-39 characters)" },
        { status: 400 }
      )
    }
    assertToken()

    // Example read call to images repo
    const statsFile = 'path/to/image.png' // your logic here
    const ghRes = await fetch(
      `https://api.github.com/repos/ravixalgorithm/openreadme-images/contents/${statsFile}`,
      { headers: ghHeaders(), cache: 'no-store' }
    )
    if (!ghRes.ok) {
      const msg = await ghRes.text()
      return NextResponse.json({ error: `GitHub API failed: ${ghRes.status} ${msg}` }, { status: 502 })
    }
    const data = await ghRes.json()
    const url = `https://raw.githubusercontent.com/ravixalgorithm/openreadme-images/main/${data.path}`

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error("💥 Image retrieval error:", error);
    return new NextResponse(JSON.stringify({
        error: "Failed to retrieve image",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
    });
  }
}
