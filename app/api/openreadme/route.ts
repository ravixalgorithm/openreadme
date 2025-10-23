/* eslint-disable @typescript-eslint/no-explicit-any */
import fetchUserData from "@/actions/fetchUserData";
import { fetchContributions } from "@/actions/githubGraphql";
import { NextRequest, NextResponse } from "next/server"
import { generateContributionGraph } from "@/utils/generate-graph";
import { fetchYearContributions } from "@/actions/fetchYearContribution";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 30; // Reduced from 45

// Cache for GitHub data (simple in-memory cache)
const dataCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

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
    sp?.get("g") ??
    sp?.get("login") ??
    (body && (body.username ?? body.userName ?? body.user ?? body.u ?? body.github ?? body.gh ?? body.login))
  return typeof u === "string" ? u.trim() : ""
}

async function logDirectUsage(username: string, theme: string): Promise<void> {
    try {
        console.log(`✅ Direct image generated for user: ${username} with theme: ${theme} at ${new Date().toISOString()}`);
    } catch (error) {
        console.log('📊 Direct usage logging failed (non-critical):', error);
    }
}

// Super optimized HTML - minimal CSS, no external dependencies
function generateFastHTML(data: any): string {
    const { name, githubURL, userStats, contributionStats } = data;

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: system-ui, -apple-system, sans-serif;
        background: #0a0a0a;
        color: white;
        width: 800px;
        height: 400px;
        overflow: hidden;
      }
      .container {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 20px;
        padding: 20px;
        height: 100%;
      }
      .hero {
        grid-column: span 2;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: 16px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .stat-card {
        background: linear-gradient(135deg, #059669, #0891b2);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .stat-card:nth-child(3) { background: linear-gradient(135deg, #dc2626, #ea580c); }
      .stat-card:nth-child(4) { background: linear-gradient(135deg, #7c3aed, #a855f7); }
      .stat-card:nth-child(5) { background: linear-gradient(135deg, #0891b2, #06b6d4); }
      .big-text { font-size: 2.5rem; font-weight: bold; margin-bottom: 8px; }
      .small-text { opacity: 0.9; font-size: 0.9rem; }
      .hero-title { font-size: 2rem; font-weight: bold; margin-bottom: 8px; }
      .hero-subtitle { opacity: 0.9; }
      .brand {
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: #14b8a6;
        padding: 4px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
      }
    </style>
</head>
<body>
    <div class="container">
      <div class="hero">
        <div class="hero-title">${name || "Developer"}</div>
        <div class="hero-subtitle">@${githubURL || "username"}</div>
        <div class="hero-subtitle">Building the future, one commit at a time</div>
      </div>

      <div class="stat-card">
        <div class="big-text">${userStats?.["Star Earned"] || "0"}</div>
        <div class="small-text">Stars</div>
      </div>

      <div class="stat-card">
        <div class="big-text">${userStats?.Commits || "0"}</div>
        <div class="small-text">Commits</div>
      </div>

      <div class="stat-card">
        <div class="big-text">${userStats?.["Pull Requests"] || "0"}</div>
        <div class="small-text">Pull Requests</div>
      </div>

      <div class="stat-card">
        <div class="big-text">${contributionStats?.currentStreak || "0"}</div>
        <div class="small-text">Day Streak</div>
      </div>
    </div>

    <div class="brand">OpenReadme</div>
</body>
</html>`;
}

// Get cached data or fetch new
async function getCachedGitHubData(username: string) {
    const cacheKey = `github_${username}`;
    const cached = dataCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log(`📦 Using cached data for ${username}`);
        return cached.data;
    }

    console.log(`🔄 Fetching fresh data for ${username}`);
    try {
        // Aggressive timeout - 3 seconds max
        const dataPromise = Promise.all([
            fetchUserData(username),
            fetchContributions(username)
        ]);

        const dataResult = await Promise.race([
            dataPromise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Data fetch timeout')), 3000)
            )
        ]) as any[];

        const result = {
            userStats: dataResult[0].userStats,
            contributionStats: dataResult[1],
        };

        // Cache the result
        dataCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        return result;
    } catch (error) {
        console.error("❌ Error fetching GitHub data:", error);

        // Return cached data even if expired, or default values
        if (cached) {
            console.log(`📦 Using expired cache for ${username}`);
            return cached.data;
        }

        return {
            userStats: {},
            contributionStats: {}
        };
    }
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(req.url);
    const directResponse = searchParams.get("direct") === "true";

    if (!directResponse) {
        return NextResponse.json(
            { error: "Use direct=true parameter for auto-updating images" },
            { status: 400 }
        );
    }

    const theme = searchParams.get("theme") || "bento";
    const username = extractUsername(req);
    const n = decodeURIComponent(searchParams.get("n") || "").trim();
    const g = decodeURIComponent(searchParams.get("g") || username).trim();

    if (!isValidGitHubUsername(g)) {
      return NextResponse.json(
        { error: "Valid GitHub username is required" },
        { status: 400 }
      )
    }

    // Basic rate limiting
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = rateLimit(clientIP, {
        windowMs: 2 * 60 * 1000, // 2 minutes
        maxRequests: 10 // Reduced for performance
    });

    if (!rateLimitResult.allowed) {
        return new NextResponse(JSON.stringify({
            error: "Rate limit exceeded",
            retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }), {
            status: 429,
            headers: { "Content-Type": "application/json" }
        });
    }

    console.log(`[${new Date().toISOString()}] 🚀 FAST generating image for: ${g}`);

    // Get GitHub data (cached or fresh)
    const { userStats, contributionStats } = await getCachedGitHubData(g);

    // Generate minimal HTML
    const html = generateFastHTML({
        name: n,
        githubURL: g,
        userStats,
        contributionStats
    });

    if (!process.env.GITHUB_TOKEN) {
        throw new Error("GitHub token not configured");
    }

    // Super fast browser setup
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = !!process.env.VERCEL;

    let browser: any;
    if (isVercel || isProduction) {
        const chromium = await import('@sparticuz/chromium');
        const puppeteerCore = await import('puppeteer-core');
        browser = await puppeteerCore.default.launch({
            args: [
                ...chromium.default.args,
                '--disable-web-security',
                '--disable-dev-shm-usage',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-images', // Don't load external images
                '--disable-javascript', // No JS needed
            ],
            defaultViewport: { width: 800, height: 400 },
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
                '--disable-web-security',
                '--disable-extensions',
                '--disable-plugins',
                '--disable-images',
                '--disable-javascript',
            ],
            defaultViewport: { width: 800, height: 400 },
            headless: true,
        });
    }

    const page = await browser.newPage();

    // Fastest possible settings
    await page.setViewport({ width: 800, height: 400, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    // Minimal wait time
    await new Promise((resolve) => setTimeout(resolve, 200));

    const screenshot = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: 800, height: 400 }
    }) as Buffer;

    await browser.close();

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ FAST generated image for ${g} in ${duration}ms`);
    logDirectUsage(g, theme);

    return new NextResponse(screenshot as BodyInit, {
        headers: {
            "Content-Type": "image/png",
            "Content-Length": screenshot.length.toString(),
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
            "Last-Modified": new Date().toUTCString(),
            "Access-Control-Allow-Origin": "*",
            "X-Content-Type-Options": "nosniff",
            "X-Generated-For": g,
            "X-Generated-At": new Date().toISOString(),
            "X-Theme": theme,
            "X-Generation-Time": `${duration}ms`,
        },
    });

  } catch (error: any) {
    const endTime = Date.now();
    console.error(`💥 FAST generation failed in ${endTime - startTime}ms:`, error);

    return new NextResponse(JSON.stringify({
        error: "Failed to generate image",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
    }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
    });
  }
}

export async function POST(_req: NextRequest) {
    return NextResponse.json(
        { error: "Use GET method with direct=true parameter for auto-updating images" },
        { status: 405 }
    );
}
