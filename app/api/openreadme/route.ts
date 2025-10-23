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
        // You can expand this to log to a database or analytics service
    } catch (error) {
        console.log('📊 Direct usage logging failed (non-critical):', error);
    }
}

// Theme HTML generators
function generateBentoHTML(data: any): string {
    const { name, githubURL, imageUrl, twitterURL, linkedinURL, portfolioUrl, userStats, contributionStats, graphSVG } = data;

    return `<!DOCTYPE html>
<head>
    <meta charset="UTF-8" />
    <title>Open Readme - Bento</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      body {
        font-family: 'Space Grotesk', sans-serif;
        margin: 0;
        padding: 0 0;
        min-height: 100vh;
        box-sizing: border-box;
      }
      .contribution-graph {
        max-height: 200px;
        overflow: visible;
      }
      .main-container {
        width: 1160px;
        max-width: 1160px;
        margin: 0 auto;
        padding: 0 0;
      }
      .grid-container {
        min-height: 1100px;
      }
      .background-icon { opacity: 0.1 !important; }
      .foreground-icon { opacity: 1 !important; }
    </style>
  </head>
  <body class="bg-neutral-950 text-white">
    <div class="main-container">
      <div class="relative grid w-full grid-cols-12 gap-4 mx-auto mb-8 grid-container">
        <!-- Hero/Name Card -->
        <div class="col-span-12 row-span-2 md:col-span-4 lg:col-span-3 group">
          <div class="relative h-full min-h-[260px] p-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 shadow-2xl">
            <div class="absolute inset-0 opacity-20">
              <div class="absolute top-0 left-0 w-20 h-20 -translate-x-10 -translate-y-10 bg-white rounded-full animate-pulse"></div>
              <div class="absolute bottom-0 right-0 w-24 h-24 translate-x-12 translate-y-12 bg-white rounded-full animate-pulse"></div>
            </div>
            <div class="relative z-10 flex flex-col justify-between h-full text-white">
              <div class="flex items-center justify-between">
                <i data-lucide="sparkles" class="w-6 h-6 text-yellow-300 animate-pulse foreground-icon"></i>
                <div class="px-3 py-1 text-lg font-medium rounded-full bg-white/20 backdrop-blur">Developer</div>
              </div>
              <div>
                <p class="mb-2 text-xl font-medium opacity-90">Hello, I'm</p>
                <h1 class="text-5xl font-bold leading-tight">${name || "Your Name"}</h1>
                <p class="mt-3 text-white/80 text-md">Building the future, one commit at a time</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Image -->
        <div class="col-span-12 row-span-3 md:col-span-8 lg:col-span-6 group">
          <div class="relative h-full min-h-[300px] overflow-hidden rounded-3xl shadow-2xl">
            ${imageUrl ? `<img src="${imageUrl}" alt="${name || 'Profile'}" class="object-cover w-full h-full" style="width: 100%; height: 100%;" />` : `
              <div class="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-800">
                <div class="text-center text-gray-600 dark:text-gray-300">
                  <i data-lucide="user" class="w-16 h-16 mx-auto mb-4 foreground-icon"></i>
                  <p class="text-lg font-medium">Add your profile image</p>
                  <p class="mt-2 text-sm opacity-75">Upload an image URL in the form above</p>
                </div>
              </div>
            `}
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div class="absolute bottom-6 left-6 right-6">
              <div class="p-4 border bg-white/10 backdrop-blur-md rounded-2xl border-white/20">
                <div class="flex items-center justify-between text-white">
                  <div>
                    <p class="text-sm opacity-80">GitHub Profile</p>
                    <p class="font-semibold">@${githubURL || "username"}</p>
                  </div>
                  <i data-lucide="github" class="w-5 h-5 foreground-icon"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Social Links Grid -->
        <div class="grid grid-cols-1 col-span-12 row-span-3 gap-4 lg:col-span-3">
          <div class="group relative h-full min-h-[120px] p-6 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl overflow-hidden shadow-lg">
            <div class="absolute -top-2 -right-2 background-icon">
              <i data-lucide="twitter" class="w-12 h-12"></i>
            </div>
            <div class="relative z-10 flex flex-col justify-between h-full text-white">
              <i data-lucide="twitter" class="w-5 h-5 foreground-icon"></i>
              <div>
                <p class="text-md opacity-80">Follow me on</p>
                <p class="font-semibold text-xl">@${twitterURL || "twitter"}</p>
              </div>
            </div>
          </div>

          <div class="group relative h-full min-h-[120px] p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl overflow-hidden shadow-lg">
            <div class="absolute -top-2 -right-2 background-icon">
              <i data-lucide="linkedin" class="w-12 h-12"></i>
            </div>
            <div class="relative z-10 flex flex-col justify-between h-full text-white">
              <i data-lucide="linkedin" class="w-5 h-5 foreground-icon"></i>
              <div>
                <p class="text-md opacity-80">Connect on</p>
                <p class="font-semibold text-xl">${linkedinURL || "LinkedIn"}</p>
              </div>
            </div>
          </div>

          <div class="group relative h-full min-h-[120px] p-6 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl overflow-hidden shadow-lg">
            <div class="absolute -top-2 -right-2 background-icon">
              <i data-lucide="globe" class="w-12 h-12"></i>
            </div>
            <div class="relative z-10 flex flex-col justify-between h-full text-white">
              <i data-lucide="globe" class="w-5 h-5 foreground-icon"></i>
              <div>
                <p class="text-md opacity-80">Visit</p>
                <p class="font-semibold text-xl truncate">${portfolioUrl ? (portfolioUrl.startsWith("https://") ? portfolioUrl.replace("https://", "") : portfolioUrl) : "Portfolio"}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- GitHub Activity Graph -->
        <div class="col-span-12 row-span-1">
          <div class="relative h-full min-h-[180px] p-6 bg-gradient-to-r from-gray-800 to-gray-800 rounded-3xl overflow-hidden shadow-xl">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <i data-lucide="activity" class="w-5 h-5 text-green-400 foreground-icon"></i>
                <h3 class="text-lg font-semibold text-white">Activity Graph</h3>
              </div>
              <div class="px-3 py-1 text-md font-medium text-green-400 rounded-full bg-green-400/10">Last 12 months</div>
            </div>
            <div class="w-full h-full">
              ${githubURL ? `<img src="https://github-readme-activity-graph.vercel.app/graph?username=${githubURL}&bg_color=1f2937&color=10b981&line=059669&point=34d399&area=true&hide_border=true" alt="Activity graph" class="object-cover w-full h-full rounded-xl" style="height: 100%; width: 100%;" />` : `
                <div class="flex items-center justify-center w-full h-20 bg-gray-700 rounded-xl">
                  <div class="text-center text-gray-400">
                    <i data-lucide="github" class="w-6 h-6 mx-auto mb-2 foreground-icon"></i>
                    <p class="text-md">Enter GitHub username to see activity graph</p>
                  </div>
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="col-span-12 row-span-2 md:col-span-6 lg:col-span-4">
          <div class="relative h-full min-h-[200px] p-6 bg-gradient-to-br from-yellow-600 to-orange-700 rounded-3xl overflow-hidden shadow-xl">
            <div class="absolute inset-0 background-icon opacity-70">
              <i data-lucide="star" class="absolute w-6 h-6 text-yellow-300 animate-pulse" style="top: 20%; left: 10%;"></i>
              <i data-lucide="star" class="absolute w-6 h-6 text-yellow-300 animate-pulse" style="top: 35%; left: 30%; animation-delay: 0.5s;"></i>
              <i data-lucide="star" class="absolute w-6 h-6 text-yellow-300 animate-pulse" style="top: 50%; left: 50%; animation-delay: 1s;"></i>
            </div>
            <div class="relative z-10 flex flex-col justify-between h-full text-white">
              <div class="flex items-center gap-2">
                <span class="text-3xl font-medium">Total Stars</span>
              </div>
              <div>
                <div class="mb-2 font-bold text-7xl">${userStats["Star Earned"] || "0"}</div>
                <p class="text-white/80 text-md">Stars earned</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mini Stats Grid -->
        <div class="grid grid-cols-2 col-span-12 row-span-2 gap-4 md:col-span-6 lg:col-span-4">
          <div class="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl">
            <i data-lucide="git-commit" class="absolute w-24 h-24 text-green-300 opacity-100 -top-2 right-2"></i>
            <div class="relative z-10 text-white top-1/2">
              <div class="text-5xl font-bold">${userStats.Commits || "0"}</div>
              <p class="text-md opacity-80">Commits</p>
            </div>
          </div>
          <div class="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
            <i data-lucide="git-pull-request" class="absolute w-24 h-24 text-pink-300 opacity-100 top-2 right-2"></i>
            <div class="relative z-10 text-white top-1/2">
              <div class="text-5xl font-bold">${userStats["Pull Requests"] || "0"}</div>
              <p class="text-md opacity-80">PRs</p>
            </div>
          </div>
          <div class="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
            <i data-lucide="users" class="absolute w-24 h-24 text-white top-2 right-2 opacity-20"></i>
            <div class="relative z-10 text-white top-1/2">
              <div class="text-5xl font-bold">${userStats.Followers || "0"}</div>
              <p class="text-md opacity-80">Followers</p>
            </div>
          </div>
          <div class="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl">
            <i data-lucide="git-branch" class="absolute w-24 h-24 text-white top-2 right-2 opacity-20"></i>
            <div class="relative z-10 text-white top-1/2">
              <div class="text-5xl font-bold">${userStats["Contributed To"] || "0"}</div>
              <p class="text-md opacity-80">Repos</p>
            </div>
          </div>
        </div>

        <!-- Streak Stats -->
        <div class="grid col-span-12 grid-rows-3 row-span-2 gap-4 lg:col-span-4">
          <div class="relative row-span-2 p-6 overflow-hidden shadow-xl bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl">
            <div class="absolute inset-0 text-orange-500 opacity-100">
              <i data-lucide="flame" class="absolute w-24 h-24 top-4 right-4"></i>
            </div>
            <div class="relative z-10 flex flex-col justify-between h-full text-white">
              <div class="flex items-center gap-2">
                <span class="font-medium">Current Streak</span>
              </div>
              <div>
                <div class="mb-1 font-bold text-7xl">${contributionStats.currentStreak || "0"}</div>
                <p class="text-md text-white/80">days</p>
              </div>
            </div>
          </div>
          <div class="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl">
            <i data-lucide="trophy" class="absolute w-12 h-12 text-white opacity-100 top-2 right-2"></i>
            <div class="relative z-10 text-white">
              <div class="text-3xl font-bold">${contributionStats.longestStreak || "0"}</div>
              <p class="text-md opacity-80">Longest</p>
            </div>
          </div>
        </div>

        <!-- Contribution Graph -->
        <div class="col-span-12 row-span-1">
          <div class="relative h-full min-h-[280px] p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-xl">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <i data-lucide="calendar" class="w-5 h-5 text-green-400 foreground-icon"></i>
                <h3 class="text-2xl font-semibold text-white">Contribution Graph</h3>
              </div>
              <div class="flex items-center gap-2 text-lg text-gray-400">
                <span>Less</span>
                <div class="flex gap-1">
                  <div class="w-3 h-3 rounded-sm" style="background-color: #0d1117"></div>
                  <div class="w-3 h-3 rounded-sm" style="background-color: #0e4429"></div>
                  <div class="w-3 h-3 rounded-sm" style="background-color: #006d32"></div>
                  <div class="w-3 h-3 rounded-sm" style="background-color: #26a641"></div>
                  <div class="w-3 h-3 rounded-sm" style="background-color: #39d353"></div>
                </div>
                <span>More</span>
              </div>
            </div>
            <div class="contribution-graph w-full h-full overflow-visible">
              ${graphSVG}
            </div>
          </div>
        </div>

        <!-- Branding -->
        <div class="absolute z-20 -bottom-4 -right-2">
          <div class="px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-lg transform -rotate-3">
            <p class="text-xl font-medium text-white">Powered by <span class="font-bold">Open Dev Society</span></p>
          </div>
        </div>
      </div>
    </div>

    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script>lucide.createIcons();</script>
  </body>
</html>`;
}

function generateMinimalHTML(data: any): string {
    const { name, githubURL, imageUrl, userStats, contributionStats } = data;

    return `<!DOCTYPE html>
<head>
    <meta charset="UTF-8" />
    <title>Open Readme - Minimal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      body {
        font-family: 'Inter', sans-serif;
        margin: 0;
        padding: 20px;
        min-height: 100vh;
        box-sizing: border-box;
      }
    </style>
  </head>
  <body class="bg-white text-gray-900">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12">
        ${imageUrl ? `<img src="${imageUrl}" alt="${name}" class="w-32 h-32 rounded-full mx-auto mb-6 object-cover" />` : ''}
        <h1 class="text-4xl font-bold mb-2">${name || "Your Name"}</h1>
        <p class="text-xl text-gray-600">@${githubURL || "username"}</p>
      </div>

      <div class="grid grid-cols-4 gap-6 mb-12">
        <div class="text-center p-6 bg-gray-50 rounded-xl">
          <div class="text-3xl font-bold text-blue-600">${userStats?.Commits || "0"}</div>
          <div class="text-sm text-gray-600">Commits</div>
        </div>
        <div class="text-center p-6 bg-gray-50 rounded-xl">
          <div class="text-3xl font-bold text-green-600">${userStats?.["Star Earned"] || "0"}</div>
          <div class="text-sm text-gray-600">Stars</div>
        </div>
        <div class="text-center p-6 bg-gray-50 rounded-xl">
          <div class="text-3xl font-bold text-purple-600">${userStats?.["Pull Requests"] || "0"}</div>
          <div class="text-sm text-gray-600">PRs</div>
        </div>
        <div class="text-center p-6 bg-gray-50 rounded-xl">
          <div class="text-3xl font-bold text-orange-600">${contributionStats?.currentStreak || "0"}</div>
          <div class="text-sm text-gray-600">Streak</div>
        </div>
      </div>

      <div class="text-center text-sm text-gray-500">
        Powered by <span class="font-semibold">Open Dev Society</span>
      </div>
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
      return generateBentoHTML(data); // fallback to bento
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const directResponse = searchParams.get("direct") === "true";

    // If not a direct request, return error
    if (!directResponse) {
        return NextResponse.json(
            { error: "Use direct=true parameter for auto-updating images" },
            { status: 400 }
        );
    }

    // Get theme parameter
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

    // Enhanced rate limiting for public safety
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = rateLimit(clientIP, {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 20 // Generous limit for direct API usage
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

    // Validate image URL if provided
    if (i && !i.startsWith('https://')) {
        return new NextResponse(JSON.stringify({ error: "Image URL must use HTTPS" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    console.log(`[${new Date().toISOString()}] 🎨 Generating ${theme} theme image for user: ${g}`);

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

    // Generate HTML based on selected theme
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

    // Launch browser and capture screenshot
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = !!process.env.VERCEL;

    let browser: any;
    if (isVercel || isProduction) {
        const chromium = await import('@sparticuz/chromium');
        const puppeteerCore = await import('puppeteer-core');
        browser = await puppeteerCore.default.launch({
            args: chromium.default.args,
            defaultViewport: { width: 1400, height: 1800 },
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
            defaultViewport: { width: 1400, height: 1800 },
            headless: true,
        });
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 1800, deviceScaleFactor: 1.5 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const screenshot = await page.screenshot({ type: "png", fullPage: true }) as Buffer;
    await browser.close();

    // Log usage for direct requests
    logDirectUsage(g, theme);

    console.log(`✅ Returning ${theme} theme image for user: ${g}`);

    return new NextResponse(screenshot, {
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=300, s-maxage=300", // 5 minutes cache
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "X-Generated-For": g,
            "X-Generated-At": new Date().toISOString(),
            "X-Theme": theme,
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

// Remove POST method since we're focusing on direct GET requests
export async function POST(req: NextRequest) {
    return NextResponse.json(
        { error: "Use GET method with direct=true parameter for auto-updating images" },
        { status: 405 }
    );
}
