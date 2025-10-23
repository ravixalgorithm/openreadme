/* eslint-disable @typescript-eslint/no-explicit-any */
import fetchUserData from "@/actions/fetchUserData";
import { fetchContributions } from "@/actions/githubGraphql";
import { NextRequest, NextResponse } from "next/server"
import { generateContributionGraph } from "@/utils/generate-graph";
import { fetchYearContributions } from "@/actions/fetchYearContribution";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 45;

// Security functions
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

// Simple usage logging for direct requests
async function logDirectUsage(username: string, theme: string): Promise<void> {
    try {
        console.log(`✅ Direct image generated for user: ${username} with theme: ${theme} at ${new Date().toISOString()}`);
    } catch (error) {
        console.log('📊 Direct usage logging failed (non-critical):', error);
    }
}

// Optimized theme HTML generators with faster loading
function generateBentoHTML(data: any): string {
    const { name, githubURL, imageUrl, twitterURL, linkedinURL, portfolioUrl, userStats, contributionStats, graphSVG } = data;

    return `<!DOCTYPE html>
<head>
    <meta charset="UTF-8" />
    <title>Open Readme - Bento</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 0;
        min-height: 100vh;
        box-sizing: border-box;
        background: #0a0a0a;
        color: white;
      }
      .main-container {
        width: 1000px;
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
      }
      .grid-container {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 16px;
        min-height: 600px;
      }
      .hero-card {
        grid-column: span 3;
        grid-row: span 2;
        background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
        border-radius: 24px;
        padding: 32px;
        position: relative;
        overflow: hidden;
      }
      .profile-card {
        grid-column: span 6;
        grid-row: span 3;
        border-radius: 24px;
        overflow: hidden;
        position: relative;
        background: #1f2937;
      }
      .social-grid {
        grid-column: span 3;
        grid-row: span 3;
        display: grid;
        gap: 16px;
      }
      .social-card {
        padding: 24px;
        border-radius: 16px;
        position: relative;
        color: white;
      }
      .twitter { background: linear-gradient(135deg, #38bdf8, #3b82f6); }
      .linkedin { background: linear-gradient(135deg, #2563eb, #1e40af); }
      .portfolio { background: linear-gradient(135deg, #10b981, #059669); }
      .stats-card {
        grid-column: span 4;
        grid-row: span 2;
        background: linear-gradient(135deg, #ea580c, #dc2626);
        border-radius: 24px;
        padding: 32px;
        text-align: center;
      }
      .mini-stats {
        grid-column: span 4;
        grid-row: span 2;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .mini-stat {
        padding: 24px;
        border-radius: 16px;
        text-align: center;
        color: white;
      }
      .commits { background: linear-gradient(135deg, #059669, #047857); }
      .prs { background: linear-gradient(135deg, #a855f7, #ec4899); }
      .followers { background: linear-gradient(135deg, #3b82f6, #6366f1); }
      .repos { background: linear-gradient(135deg, #0891b2, #06b6d4); }
      .streak-grid {
        grid-column: span 4;
        grid-row: span 2;
        display: grid;
        grid-template-rows: 2fr 1fr;
        gap: 16px;
      }
      .current-streak {
        background: linear-gradient(135deg, #ea580c, #dc2626);
        border-radius: 16px;
        padding: 24px;
        text-align: center;
        color: white;
      }
      .longest-streak {
        background: linear-gradient(135deg, #eab308, #f59e0b);
        border-radius: 16px;
        padding: 16px;
        text-align: center;
        color: white;
      }
      .activity-graph {
        grid-column: span 12;
        background: #1f2937;
        border-radius: 24px;
        padding: 24px;
        min-height: 120px;
      }
      .branding {
        position: absolute;
        bottom: -8px;
        right: -8px;
        background: linear-gradient(135deg, #14b8a6, #06b6d4);
        padding: 8px 16px;
        border-radius: 12px;
        transform: rotate(-3deg);
        font-size: 14px;
        font-weight: 600;
      }
      img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <div class="main-container">
      <div class="grid-container">
        <!-- Hero Card -->
        <div class="hero-card">
          <h1 style="font-size: 2.5rem; font-weight: bold; margin: 0 0 8px 0;">
            ${name || "Your Name"}
          </h1>
          <p style="opacity: 0.9; margin: 0;">Building the future, one commit at a time</p>
        </div>

        <!-- Profile Image -->
        <div class="profile-card">
          ${imageUrl ? `<img src="${imageUrl}" alt="${name || 'Profile'}" style="width: 100%; height: 100%; object-fit: cover;" />` : `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #6b7280, #4b5563);">
              <div style="text-align: center; color: #d1d5db;">
                <div style="font-size: 3rem; margin-bottom: 16px;">👤</div>
                <p style="font-size: 1.125rem; font-weight: 500;">Add your profile image</p>
              </div>
            </div>
          `}
          <div style="position: absolute; bottom: 24px; left: 24px; right: 24px;">
            <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(8px); padding: 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2);">
              <p style="margin: 0; opacity: 0.8; font-size: 0.875rem;">GitHub Profile</p>
              <p style="margin: 4px 0 0 0; font-weight: 600;">@${githubURL || "username"}</p>
            </div>
          </div>
        </div>

        <!-- Social Links -->
        <div class="social-grid">
          <div class="social-card twitter">
            <p style="margin: 0 0 8px 0; opacity: 0.8;">Follow me on</p>
            <p style="margin: 0; font-weight: 600; font-size: 1.25rem;">@${twitterURL || "twitter"}</p>
          </div>
          <div class="social-card linkedin">
            <p style="margin: 0 0 8px 0; opacity: 0.8;">Connect on</p>
            <p style="margin: 0; font-weight: 600; font-size: 1.25rem;">${linkedinURL || "LinkedIn"}</p>
          </div>
          <div class="social-card portfolio">
            <p style="margin: 0 0 8px 0; opacity: 0.8;">Visit</p>
            <p style="margin: 0; font-weight: 600; font-size: 1.25rem;">${portfolioUrl ? (portfolioUrl.startsWith("https://") ? portfolioUrl.replace("https://", "") : portfolioUrl) : "Portfolio"}</p>
          </div>
        </div>

        <!-- Total Stars -->
        <div class="stats-card">
          <h2 style="margin: 0 0 16px 0; font-size: 1.5rem;">Total Stars</h2>
          <div style="font-size: 4rem; font-weight: bold; margin: 16px 0;">${userStats["Star Earned"] || "0"}</div>
          <p style="margin: 0; opacity: 0.8;">Stars earned</p>
        </div>

        <!-- Mini Stats -->
        <div class="mini-stats">
          <div class="mini-stat commits">
            <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${userStats.Commits || "0"}</div>
            <p style="margin: 0; opacity: 0.8;">Commits</p>
          </div>
          <div class="mini-stat prs">
            <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${userStats["Pull Requests"] || "0"}</div>
            <p style="margin: 0; opacity: 0.8;">PRs</p>
          </div>
          <div class="mini-stat followers">
            <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${userStats.Followers || "0"}</div>
            <p style="margin: 0; opacity: 0.8;">Followers</p>
          </div>
          <div class="mini-stat repos">
            <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${userStats["Contributed To"] || "0"}</div>
            <p style="margin: 0; opacity: 0.8;">Repos</p>
          </div>
        </div>

        <!-- Streak Stats -->
        <div class="streak-grid">
          <div class="current-streak">
            <p style="margin: 0 0 16px 0; font-weight: 500;">Current Streak</p>
            <div style="font-size: 4rem; font-weight: bold; margin-bottom: 8px;">${contributionStats.currentStreak || "0"}</div>
            <p style="margin: 0; opacity: 0.8;">days</p>
          </div>
          <div class="longest-streak">
            <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 4px;">${contributionStats.longestStreak || "0"}</div>
            <p style="margin: 0; opacity: 0.8;">Longest</p>
          </div>
        </div>

        <!-- Activity Graph -->
        <div class="activity-graph">
          <h3 style="margin: 0 0 16px 0; color: #10b981;">Activity Graph</h3>
          ${githubURL ? `<img src="https://github-readme-activity-graph.vercel.app/graph?username=${githubURL}&bg_color=1f2937&color=10b981&line=059669&point=34d399&area=true&hide_border=true" alt="Activity graph" style="width: 100%; height: 80px; border-radius: 12px;" />` : `
            <div style="display: flex; align-items: center; justify-content: center; height: 80px; background: #374151; border-radius: 12px;">
              <p style="margin: 0; color: #9ca3af;">Enter GitHub username to see activity graph</p>
            </div>
          `}
        </div>
      </div>

      <!-- Branding -->
      <div class="branding">
        Powered by <strong>Open Dev Society</strong>
      </div>
    </div>
</body>
</html>`;
}

function generateMinimalHTML(data: any): string {
    const { name, githubURL, imageUrl, userStats, contributionStats } = data;

    return `<!DOCTYPE html>
<head>
    <meta charset="UTF-8" />
    <title>Open Readme - Minimal</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 40px;
        min-height: 100vh;
        background: white;
        color: #1f2937;
      }
      .container { max-width: 800px; margin: 0 auto; text-align: center; }
      .profile-img { width: 120px; height: 120px; border-radius: 50%; margin: 0 auto 24px auto; object-fit: cover; }
      .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin: 48px 0; }
      .stat-card { padding: 24px; background: #f9fafb; border-radius: 12px; text-align: center; }
      .stat-number { font-size: 2rem; font-weight: bold; margin-bottom: 8px; }
      .stat-label { font-size: 0.875rem; color: #6b7280; }
      .blue { color: #3b82f6; }
      .green { color: #10b981; }
      .purple { color: #8b5cf6; }
      .orange { color: #f59e0b; }
    </style>
</head>
<body>
    <div class="container">
      ${imageUrl ? `<img src="${imageUrl}" alt="${name}" class="profile-img" />` : ''}
      <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${name || "Your Name"}</h1>
      <p style="font-size: 1.25rem; color: #6b7280; margin-bottom: 0;">@${githubURL || "username"}</p>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number blue">${userStats?.Commits || "0"}</div>
          <div class="stat-label">Commits</div>
        </div>
        <div class="stat-card">
          <div class="stat-number green">${userStats?.["Star Earned"] || "0"}</div>
          <div class="stat-label">Stars</div>
        </div>
        <div class="stat-card">
          <div class="stat-number purple">${userStats?.["Pull Requests"] || "0"}</div>
          <div class="stat-label">PRs</div>
        </div>
        <div class="stat-card">
          <div class="stat-number orange">${contributionStats?.currentStreak || "0"}</div>
          <div class="stat-label">Streak</div>
        </div>
      </div>

      <p style="font-size: 0.875rem; color: #6b7280;">
        Powered by <strong>Open Dev Society</strong>
      </p>
    </div>
</body>
</html>`;
}

function generateThemeHTML(theme: string, data: any): string {
  switch (theme) {
    case 'bento':
      return generateBentoHTML(data);
    case 'minimal':
      return generateMinimalHTML(data);
    default:
      return generateBentoHTML(data);
  }
}

export async function GET(req: NextRequest) {
  try {
    const startTime = Date.now();
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
    const i = decodeURIComponent(searchParams.get("i") || "").trim();
    const x = decodeURIComponent(searchParams.get("x") || "").trim();
    const l = decodeURIComponent(searchParams.get("l") || "").trim();
    const p = decodeURIComponent(searchParams.get("p") || "").trim();

    if (!isValidGitHubUsername(g)) {
      return NextResponse.json(
        { error: "Valid GitHub username is required (2-39 characters)" },
        { status: 400 }
      )
    }

    // Rate limiting
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = rateLimit(clientIP, {
        windowMs: 5 * 60 * 1000,
        maxRequests: 20
    });

    if (!rateLimitResult.allowed) {
        return new NextResponse(JSON.stringify({
            error: "Rate limit exceeded",
            message: "Too many requests. Please wait before generating another image.",
            retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }), {
            status: 429,
            headers: { "Content-Type": "application/json" }
        });
    }

    if (i && !i.startsWith('https://')) {
        return new NextResponse(JSON.stringify({ error: "Image URL must use HTTPS" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    console.log(`[${new Date().toISOString()}] 🎨 Generating ${theme} theme image for user: ${g}`);

    // Fetch GitHub data with timeout
    let userStats: any = {};
    let contributionStats: any = {};
    let graphSVG = "";

    if (g) {
        try {
            const dataPromise = Promise.all([
                fetchUserData(g),
                fetchContributions(g),
                fetchYearContributions(g, new Date().getFullYear())
            ]);

            // Add timeout to data fetching
            const dataResult = await Promise.race([
                dataPromise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Data fetch timeout')), 8000)
                )
            ]) as any[];

            userStats = dataResult[0].userStats;
            contributionStats = dataResult[1];
            graphSVG = generateContributionGraph(dataResult[2]);
        } catch (error) {
            console.error("❌ Error fetching GitHub data:", error);
            userStats = {};
            contributionStats = {};
        }
    }

    const html = generateThemeHTML(theme, {
        name: n,
        githubURL: g,
        imageUrl: i,
        twitterURL: x,
        linkedinURL: l,
        portfolioUrl: p,
        userStats,
        contributionStats,
        graphSVG
    });

    if (!process.env.GITHUB_TOKEN) {
        throw new Error("GitHub token not configured");
    }

    // Optimized browser launch
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = !!process.env.VERCEL;

    let browser: any;
    if (isVercel || isProduction) {
        const chromium = await import('@sparticuz/chromium');
        const puppeteerCore = await import('puppeteer-core');
        browser = await puppeteerCore.default.launch({
            args: [...chromium.default.args, '--disable-web-security', '--disable-dev-shm-usage'],
            defaultViewport: { width: 1000, height: 600 }, // Smaller viewport
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
                '--disable-web-security'
            ],
            defaultViewport: { width: 1000, height: 600 }, // Smaller viewport
            headless: true,
        });
    }

    const page = await browser.newPage();

    // Optimized page settings
    await page.setViewport({ width: 1000, height: 600, deviceScaleFactor: 1 }); // Reduced scale
    await page.setContent(html, { waitUntil: "domcontentloaded" }); // Faster wait condition

    // Reduced wait time
    await new Promise((resolve) => setTimeout(resolve, 500)); // Much faster

    const screenshot = await page.screenshot({
        type: "png",
        fullPage: true,
        optimizeForSpeed: true
    }) as Buffer;

    await browser.close();

    logDirectUsage(g, theme);

    const endTime = Date.now();
    console.log(`✅ Generated ${theme} image for ${g} in ${endTime - startTime}ms`);

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
            "X-Generation-Time": `${endTime - startTime}ms`,
        },
    });

  } catch (error: any) {
    console.error("💥 Direct image generation error:", error);
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
