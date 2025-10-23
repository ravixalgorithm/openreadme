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
        maxRequests: 10 // Increased from 3 to 10 for development
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

    // Beautiful HTML template matching the bento grid design
    /* stylelint-disable */
    const html = `<!DOCTYPE html>
<head>
    <meta charset="UTF-8" />
    <title>Open Readme</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      body {
        font-family: 'Space Grotesk', sans-serif;
        margin: 0;
        padding: 4px 0;
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
        padding: 0 4px;
      }
      .grid-container {
        min-height: 1100px;
      }
      /* Fix icon sizes */
      .background-icon {
        opacity: 0.1 !important;
      }
      .foreground-icon {
        opacity: 1 !important;
      }
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
                <h1 class="text-5xl font-bold leading-tight">${n || "Your Name"}</h1>
                <p class="mt-3 text-white/80 text-md">Building the future, one commit at a time</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Image -->
        <div class="col-span-12 row-span-3 md:col-span-8 lg:col-span-6 group">
          <div class="relative h-full min-h-[300px] overflow-hidden rounded-3xl shadow-2xl">
            ${i ? `<img src="${i}" alt="${n || 'Profile'}" class="object-cover w-full h-full" style="width: 100%; height: 100%;" />` : `
              <div class="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-800">
                <div class="text-center text-gray-600 dark:text-gray-300">
                  <i data-lucide="user" class="w-16 h-16 mx-auto mb-4 foreground-icon"></i>
                  <p class="text-lg font-medium">Add your profile image</p>
                  <p class="mt-2 text-sm opacity-75">Upload an image URL in the form above</p>
                </div>
              </div>
            `}
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            <!-- Floating info card -->
            <div class="absolute bottom-6 left-6 right-6">
              <div class="p-4 border bg-white/10 backdrop-blur-md rounded-2xl border-white/20">
                <div class="flex items-center justify-between text-white">
                  <div>
                    <p class="text-sm opacity-80">GitHub Profile</p>
                    <p class="font-semibold">@${g || "username"}</p>
                  </div>
                  <i data-lucide="github" class="w-5 h-5 foreground-icon"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Social Links Grid -->
        <div class="grid grid-cols-1 col-span-12 row-span-3 gap-4 lg:col-span-3">
          <!-- Twitter -->
          <div class="group relative h-full min-h-[120px] p-6 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl overflow-hidden shadow-lg">
            <div class="absolute -top-2 -right-2 background-icon">
              <i data-lucide="twitter" class="w-12 h-12"></i>
            </div>
            <div class="relative z-10 flex flex-col justify-between h-full text-white">
              <i data-lucide="twitter" class="w-5 h-5 foreground-icon"></i>
              <div>
                <p class="text-md opacity-80">Follow me on</p>
                <p class="font-semibold text-xl">@${x || "twitter"}</p>
              </div>
            </div>
          </div>

          <!-- LinkedIn -->
          <div class="group relative h-full min-h-[120px] p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl overflow-hidden shadow-lg">
            <div class="absolute -top-2 -right-2 background-icon">
              <i data-lucide="linkedin" class="w-12 h-12"></i>
            </div>
            <div class="relative z-10 flex flex-col justify-between h-full text-white">
              <i data-lucide="linkedin" class="w-5 h-5 foreground-icon"></i>
              <div>
                <p class="text-md opacity-80">Connect on</p>
                <p class="font-semibold text-xl">${l || "LinkedIn"}</p>
              </div>
            </div>
          </div>

          <!-- Portfolio -->
          <div class="group relative h-full min-h-[120px] p-6 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl overflow-hidden shadow-lg">
            <div class="absolute -top-2 -right-2 background-icon">
              <i data-lucide="globe" class="w-12 h-12"></i>
            </div>
            <div class="relative z-10 flex flex-col justify-between h-full text-white">
              <i data-lucide="globe" class="w-5 h-5 foreground-icon"></i>
              <div>
                <p class="text-md opacity-80">Visit</p>
                <p class="font-semibold text-xl truncate">${p ? (p.startsWith("https://") ? p.replace("https://", "") : p) : "Portfolio"}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- GitHub Activity Graph - Fixed Height -->
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
              ${g ? `<img src="https://github-readme-activity-graph.vercel.app/graph?username=${g}&bg_color=1f2937&color=10b981&line=059669&point=34d399&area=true&hide_border=true" alt="Activity graph" class="object-cover w-full h-full rounded-xl" style="height: 100%; width: 100%;" />` : `
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

        <!-- Total Stars - Hero Card -->
        <div class="col-span-12 row-span-2 md:col-span-6 lg:col-span-4">
          <div class="relative h-full min-h-[200px] p-6 bg-gradient-to-br from-yellow-600 to-orange-700 rounded-3xl overflow-hidden shadow-xl">
            <div class="absolute inset-0 background-icon opacity-70">
              <i data-lucide="star" class="absolute w-6 h-6 text-yellow-300 animate-pulse" style="top: 20%; left: 10%;"></i>
              <i data-lucide="star" class="absolute w-6 h-6 text-yellow-300 animate-pulse" style="top: 35%; left: 30%; animation-delay: 0.5s;"></i>
              <i data-lucide="star" class="absolute w-6 h-6 text-yellow-300 animate-pulse" style="top: 50%; left: 50%; animation-delay: 1s;"></i>
              <i data-lucide="star" class="absolute w-6 h-6 text-yellow-300 animate-pulse" style="top: 65%; left: 70%; animation-delay: 1.5s;"></i>
              <i data-lucide="star" class="absolute w-6 h-6 text-yellow-300 animate-pulse" style="top: 80%; left: 90%; animation-delay: 2s;"></i>
            </div>
            <div class="relative z-10 flex flex-col justify-between h-full text-white">
              <div class="flex items-center gap-2">
                <span class="text-3xl font-medium">Total Stars</span>
              </div>
              <div>
                <div class="mb-2 font-bold text-7xl">${userStats["Star Earned"] || "0"}</div>
                <p class="text-white/80 text-md">Stars earned across repositories</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Mini Grid -->
        <div class="grid grid-cols-2 col-span-12 row-span-2 gap-4 md:col-span-6 lg:col-span-4">
          <!-- Commits -->
          <div class="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl">
            <i data-lucide="git-commit" class="absolute w-24 h-24 text-green-300 opacity-100 -top-2 right-2"></i>
            <div class="relative z-10 text-white top-1/2">
              <div class="text-5xl font-bold">${userStats.Commits || "0"}</div>
              <p class="text-md opacity-80">Commits</p>
            </div>
          </div>

          <!-- Pull Requests -->
          <div class="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
            <i data-lucide="git-pull-request" class="absolute w-24 h-24 text-pink-300 opacity-100 top-2 right-2"></i>
            <div class="relative z-10 text-white top-1/2">
              <div class="text-5xl font-bold">${userStats["Pull Requests"] || "0"}</div>
              <p class="text-md opacity-80">Pull Requests</p>
            </div>
          </div>

          <!-- Followers -->
          <div class="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
            <i data-lucide="users" class="absolute w-24 h-24 text-white top-2 right-2 opacity-20"></i>
            <div class="relative z-10 text-white top-1/2">
              <div class="text-5xl font-bold">${userStats.Followers || "0"}</div>
              <p class="text-md opacity-80">Followers</p>
            </div>
          </div>

          <!-- Contributed To -->
          <div class="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl">
            <i data-lucide="git-branch" class="absolute w-24 h-24 text-white top-2 right-2 opacity-20"></i>
            <div class="relative z-10 text-white top-1/2">
              <div class="text-5xl font-bold">${userStats["Contributed To"] || "0"}</div>
              <p class="text-md opacity-80">Contributed To</p>
            </div>
          </div>
        </div>

        <!-- Streak Stats -->
        <div class="grid col-span-12 grid-rows-3 row-span-2 gap-4 lg:col-span-4">
          <!-- Current Streak -->
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

          <!-- Longest Streak -->
          <div class="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl">
            <i data-lucide="trophy" class="absolute w-12 h-12 text-white opacity-100 top-2 right-2"></i>
            <div class="relative z-10 text-white">
              <div class="text-3xl font-bold">${contributionStats.longestStreak || "0"}</div>
              <p class="text-md opacity-80">Longest Streak</p>
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

        <!-- Open Dev Society Branding -->
        <div class="absolute z-20 -bottom-4 -right-2">
          <div class="px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-lg transform -rotate-3">
            <p class="text-xl font-medium text-white">Powered by <span class="font-bold">Open Dev Society</span></p>
          </div>
        </div>

    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script>lucide.createIcons();</script>
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
