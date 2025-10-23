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

// Exact replica of your BentoClassic theme as HTML
function generateBentoHTML(data: any): string {
    const { name, githubURL, imageUrl, twitterURL, linkedinURL, portfolioUrl, userStats, contributionStats, graphSVG } = data;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Open Readme - Bento Classic</title>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0a0a0a;
        color: white;
        width: 1200px;
        height: 800px;
        overflow: hidden;
        padding: 20px;
      }

      .main-container {
        width: 100%;
        max-width: 1160px;
        margin: 0 auto;
        position: relative;
      }

      .grid-container {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 16px;
        width: 100%;
        height: 760px;
        position: relative;
      }

      /* Hero Card */
      .hero-card {
        grid-column: span 3;
        grid-row: span 2;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
        border-radius: 24px;
        padding: 32px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }

      .hero-bg {
        position: absolute;
        inset: 0;
        opacity: 0.2;
      }

      .hero-bg-circle-1 {
        position: absolute;
        top: 0;
        left: 0;
        width: 128px;
        height: 128px;
        background: white;
        border-radius: 50%;
        transform: translate(-64px, -64px);
        animation: pulse 2s infinite;
      }

      .hero-bg-circle-2 {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 160px;
        height: 160px;
        background: white;
        border-radius: 50%;
        transform: translate(80px, 80px);
        animation: pulse 2s infinite;
        animation-delay: 1s;
      }

      .hero-content {
        position: relative;
        z-index: 10;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        color: white;
      }

      .hero-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .hero-badge {
        padding: 4px 12px;
        font-size: 12px;
        font-weight: 500;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 9999px;
        backdrop-filter: blur(8px);
      }

      .hero-greeting {
        margin-bottom: 8px;
        font-size: 18px;
        font-weight: 500;
        opacity: 0.9;
      }

      .hero-name {
        font-size: 40px;
        font-weight: bold;
        line-height: 1.2;
        margin-bottom: 12px;
      }

      .hero-tagline {
        margin-top: 12px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 16px;
      }

      /* Profile Image */
      .profile-card {
        grid-column: span 6;
        grid-row: span 3;
        border-radius: 24px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }

      .profile-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .profile-placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #6b7280, #4b5563);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: #d1d5db;
      }

      .profile-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent, transparent);
      }

      .profile-info {
        position: absolute;
        bottom: 24px;
        left: 24px;
        right: 24px;
      }

      .profile-info-card {
        padding: 16px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .profile-info-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: white;
      }

      .profile-info-text p:first-child {
        font-size: 14px;
        opacity: 0.8;
        margin-bottom: 4px;
      }

      .profile-info-text p:last-child {
        font-weight: 600;
      }

      /* Social Links */
      .social-grid {
        grid-column: span 3;
        grid-row: span 3;
        display: grid;
        gap: 16px;
      }

      .social-card {
        position: relative;
        min-height: 120px;
        padding: 24px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .social-twitter {
        background: linear-gradient(135deg, #38bdf8, #3b82f6);
      }

      .social-linkedin {
        background: linear-gradient(135deg, #2563eb, #1e40af);
      }

      .social-portfolio {
        background: linear-gradient(135deg, #10b981, #059669);
      }

      .social-bg-icon {
        position: absolute;
        top: -16px;
        right: -16px;
        opacity: 0.2;
      }

      .social-content {
        position: relative;
        z-index: 10;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
      }

      .social-label {
        font-size: 14px;
        opacity: 0.8;
        margin-bottom: 8px;
      }

      .social-handle {
        font-weight: 600;
        font-size: 20px;
      }

      /* Activity Graph */
      .activity-card {
        grid-column: span 12;
        grid-row: span 1;
        background: linear-gradient(to right, #1f2937, #1f2937);
        border-radius: 24px;
        padding: 24px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        min-height: 180px;
      }

      .activity-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .activity-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .activity-title h3 {
        font-size: 18px;
        font-weight: 600;
        color: white;
      }

      .activity-badge {
        padding: 4px 12px;
        font-size: 14px;
        font-weight: 500;
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
        border-radius: 9999px;
      }

      .activity-graph-container {
        width: 100%;
        height: 100px;
      }

      .activity-graph {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
      }

      .activity-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px;
        background: #374151;
        border-radius: 12px;
        text-align: center;
        color: #9ca3af;
      }

      /* Stats Cards */
      .stats-card {
        grid-column: span 4;
        grid-row: span 2;
        background: linear-gradient(135deg, #ea580c, #dc2626);
        border-radius: 24px;
        padding: 32px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        text-align: center;
      }

      .stats-bg {
        position: absolute;
        inset: 0;
        opacity: 0.7;
      }

      .star-icon {
        position: absolute;
        color: #fde047;
        animation: pulse 2s infinite;
      }

      .star-1 { top: 20%; left: 10%; animation-delay: 0s; }
      .star-2 { top: 35%; left: 30%; animation-delay: 0.5s; }
      .star-3 { top: 50%; left: 50%; animation-delay: 1s; }
      .star-4 { top: 25%; right: 15%; animation-delay: 1.5s; }
      .star-5 { top: 60%; right: 25%; animation-delay: 2s; }

      .stats-content {
        position: relative;
        z-index: 10;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        color: white;
        text-align: center;
      }

      .stats-title {
        font-size: 24px;
        font-weight: 500;
        margin-bottom: 16px;
      }

      .stats-number {
        font-size: 56px;
        font-weight: bold;
        margin-bottom: 8px;
      }

      .stats-label {
        color: rgba(255, 255, 255, 0.8);
        font-size: 16px;
      }

      /* Mini Stats */
      .mini-stats {
        grid-column: span 4;
        grid-row: span 2;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .mini-stat {
        position: relative;
        padding: 16px;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        color: white;
        text-align: center;
      }

      .mini-stat-commits {
        background: linear-gradient(135deg, #059669, #047857);
      }

      .mini-stat-prs {
        background: linear-gradient(135deg, #a855f7, #ec4899);
      }

      .mini-stat-followers {
        background: linear-gradient(135deg, #3b82f6, #6366f1);
      }

      .mini-stat-repos {
        background: linear-gradient(135deg, #0891b2, #06b6d4);
      }

      .mini-stat-bg-icon {
        position: absolute;
        top: 8px;
        right: 8px;
        opacity: 0.2;
      }

      .mini-stat-bg-icon-large {
        position: absolute;
        top: -8px;
        right: 8px;
        opacity: 1;
      }

      .mini-stat-content {
        position: relative;
        z-index: 10;
        color: white;
        margin-top: 20px;
      }

      .mini-stat-number {
        font-size: 40px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .mini-stat-label {
        font-size: 12px;
        opacity: 0.8;
      }

      /* Streak Stats */
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
        position: relative;
        overflow: hidden;
        color: white;
        text-align: center;
      }

      .streak-bg {
        position: absolute;
        inset: 0;
        color: #ea580c;
        opacity: 1;
      }

      .streak-bg-icon {
        position: absolute;
        top: 16px;
        right: 16px;
      }

      .streak-content {
        position: relative;
        z-index: 10;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        color: white;
      }

      .streak-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        margin-bottom: 16px;
      }

      .streak-number {
        font-size: 56px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .streak-days {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
      }

      .longest-streak {
        background: linear-gradient(135deg, #eab308, #f59e0b);
        border-radius: 16px;
        padding: 16px;
        position: relative;
        overflow: hidden;
        color: white;
        text-align: center;
      }

      .longest-streak-bg-icon {
        position: absolute;
        top: 8px;
        right: 8px;
        opacity: 1;
      }

      .longest-streak-content {
        position: relative;
        z-index: 10;
        color: white;
      }

      .longest-streak-number {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .longest-streak-label {
        font-size: 12px;
        opacity: 0.8;
      }

      /* Contribution Graph */
      .contribution-card {
        grid-column: span 12;
        grid-row: span 1;
        background: linear-gradient(135deg, #111827, #1f2937, #111827);
        border-radius: 24px;
        padding: 24px;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        min-height: 280px;
      }

      .contribution-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
      }

      .contribution-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .contribution-title h3 {
        font-size: 32px;
        font-weight: 600;
        color: white;
      }

      .contribution-legend {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        color: #9ca3af;
      }

      .legend-dots {
        display: flex;
        gap: 4px;
      }

      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 2px;
      }

      .contribution-graph {
        width: 100%;
        height: 200px;
        overflow: visible;
      }

      /* Branding */
      .branding {
        position: absolute;
        bottom: -16px;
        right: -8px;
        z-index: 20;
      }

      .branding-card {
        padding: 8px 16px;
        background: linear-gradient(135deg, #14b8a6, #06b6d4);
        border-radius: 12px;
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
        transform: rotate(-3deg);
      }

      .branding-text {
        font-size: 14px;
        font-weight: 600;
        color: white;
      }

      .branding-highlight {
        font-weight: bold;
      }

      /* Animations */
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      .icon {
        width: 24px;
        height: 24px;
      }

      .icon-sm {
        width: 16px;
        height: 16px;
      }

      .icon-lg {
        width: 32px;
        height: 32px;
      }

      .icon-xl {
        width: 48px;
        height: 48px;
      }

      .icon-2xl {
        width: 64px;
        height: 64px;
      }

      .icon-3xl {
        width: 80px;
        height: 80px;
      }

      .icon-4xl {
        width: 96px;
        height: 96px;
      }
    </style>
</head>
<body>
    <div class="main-container">
        <div class="grid-container">
            <!-- Hero/Name Card -->
            <div class="hero-card">
                <div class="hero-bg">
                    <div class="hero-bg-circle-1"></div>
                    <div class="hero-bg-circle-2"></div>
                </div>
                <div class="hero-content">
                    <div class="hero-header">
                        <i data-lucide="sparkles" class="icon text-yellow-300"></i>
                        <div class="hero-badge">Developer</div>
                    </div>
                    <div>
                        <p class="hero-greeting">Hello, I'm</p>
                        <h1 class="hero-name">${name || "Your Name"}</h1>
                        <p class="hero-tagline">Building the future, one commit at a time</p>
                    </div>
                </div>
            </div>

            <!-- Profile Image -->
            <div class="profile-card">
                ${imageUrl ? `
                    <img src="${imageUrl}" alt="${name || 'Profile'}" class="profile-img" />
                ` : `
                    <div class="profile-placeholder">
                        <i data-lucide="user" class="icon-4xl"></i>
                        <p style="font-size: 18px; font-weight: 500; margin-top: 16px;">Add your profile image</p>
                        <p style="margin-top: 8px; font-size: 14px; opacity: 0.75;">Upload an image URL in the form above</p>
                    </div>
                `}
                <div class="profile-overlay"></div>
                <div class="profile-info">
                    <div class="profile-info-card">
                        <div class="profile-info-content">
                            <div class="profile-info-text">
                                <p>GitHub Profile</p>
                                <p>@${githubURL || "username"}</p>
                            </div>
                            <i data-lucide="github" class="icon"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Social Links Grid -->
            <div class="social-grid">
                <!-- Twitter -->
                <div class="social-card social-twitter">
                    <div class="social-bg-icon">
                        <i data-lucide="twitter" class="icon-3xl"></i>
                    </div>
                    <div class="social-content">
                        <i data-lucide="twitter" class="icon"></i>
                        <div>
                            <p class="social-label">Follow me on</p>
                            <p class="social-handle">@${twitterURL || "twitter"}</p>
                        </div>
                    </div>
                </div>

                <!-- LinkedIn -->
                <div class="social-card social-linkedin">
                    <div class="social-bg-icon">
                        <i data-lucide="linkedin" class="icon-3xl"></i>
                    </div>
                    <div class="social-content">
                        <i data-lucide="linkedin" class="icon"></i>
                        <div>
                            <p class="social-label">Connect on</p>
                            <p class="social-handle">${linkedinURL || "LinkedIn"}</p>
                        </div>
                    </div>
                </div>

                <!-- Portfolio -->
                <div class="social-card social-portfolio">
                    <div class="social-bg-icon">
                        <i data-lucide="globe" class="icon-3xl"></i>
                    </div>
                    <div class="social-content">
                        <i data-lucide="globe" class="icon"></i>
                        <div>
                            <p class="social-label">Visit</p>
                            <p class="social-handle" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                ${portfolioUrl ? (portfolioUrl.startsWith("https://") ? portfolioUrl.replace("https://", "") : portfolioUrl) : "Portfolio"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- GitHub Activity Graph -->
            <div class="activity-card">
                <div class="activity-header">
                    <div class="activity-title">
                        <i data-lucide="activity" class="icon text-green-400"></i>
                        <h3>Activity Graph</h3>
                    </div>
                    <div class="activity-badge">Last 12 months</div>
                </div>
                <div class="activity-graph-container">
                    ${githubURL ? `
                        <img src="https://github-readme-activity-graph.vercel.app/graph?username=${githubURL}&bg_color=1f2937&color=10b981&line=059669&point=34d399&area=true&hide_border=true" alt="Activity graph" class="activity-graph" />
                    ` : `
                        <div class="activity-placeholder">
                            <div style="text-align: center;">
                                <i data-lucide="github" class="icon-lg" style="margin-bottom: 8px;"></i>
                                <p style="font-size: 14px;">Enter GitHub username to see activity graph</p>
                            </div>
                        </div>
                    `}
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-card">
                <div class="stats-bg">
                    <i data-lucide="star" class="star-icon star-1" style="width: 24px; height: 24px;"></i>
                    <i data-lucide="star" class="star-icon star-2" style="width: 24px; height: 24px;"></i>
                    <i data-lucide="star" class="star-icon star-3" style="width: 24px; height: 24px;"></i>
                    <i data-lucide="star" class="star-icon star-4" style="width: 24px; height: 24px;"></i>
                    <i data-lucide="star" class="star-icon star-5" style="width: 24px; height: 24px;"></i>
                </div>
                <div class="stats-content">
                    <div class="stats-title">Total Stars</div>
                    <div>
                        <div class="stats-number">${userStats["Star Earned"] || "0"}</div>
                        <p class="stats-label">Stars earned across repositories</p>
                    </div>
                </div>
            </div>

            <!-- Mini Stats Grid -->
            <div class="mini-stats">
                <!-- Commits -->
                <div class="mini-stat mini-stat-commits">
                    <i data-lucide="git-commit" class="mini-stat-bg-icon-large icon-4xl" style="color: #10b981;"></i>
                    <div class="mini-stat-content">
                        <div class="mini-stat-number">${userStats.Commits || "0"}</div>
                        <p class="mini-stat-label">Commits</p>
                    </div>
                </div>

                <!-- Pull Requests -->
                <div class="mini-stat mini-stat-prs">
                    <i data-lucide="git-pull-request" class="mini-stat-bg-icon-large icon-4xl" style="color: #f472b6;"></i>
                    <div class="mini-stat-content">
                        <div class="mini-stat-number">${userStats["Pull Requests"] || "0"}</div>
                        <p class="mini-stat-label">Pull Requests</p>
                    </div>
                </div>

                <!-- Followers -->
                <div class="mini-stat mini-stat-followers">
                    <i data-lucide="users" class="mini-stat-bg-icon icon-4xl" style="color: white;"></i>
                    <div class="mini-stat-content">
                        <div class="mini-stat-number">${userStats.Followers || "0"}</div>
                        <p class="mini-stat-label">Followers</p>
                    </div>
                </div>

                <!-- Contributed To -->
                <div class="mini-stat mini-stat-repos">
                    <i data-lucide="git-branch" class="mini-stat-bg-icon icon-4xl" style="color: white;"></i>
                    <div class="mini-stat-content">
                        <div class="mini-stat-number">${userStats["Contributed To"] || "0"}</div>
                        <p class="mini-stat-label">Contributed To</p>
                    </div>
                </div>
            </div>

            <!-- Streak Stats -->
            <div class="streak-grid">
                <!-- Current Streak -->
                <div class="current-streak">
                    <div class="streak-bg">
                        <i data-lucide="flame" class="streak-bg-icon icon-4xl"></i>
                    </div>
                    <div class="streak-content">
                        <div class="streak-label">
                            <span>Current Streak</span>
                        </div>
                        <div>
                            <div class="streak-number">${contributionStats.currentStreak || "0"}</div>
                            <p class="streak-days">days</p>
                        </div>
                    </div>
                </div>

                <!-- Longest Streak -->
                <div class="longest-streak">
                    <i data-lucide="trophy" class="longest-streak-bg-icon icon-xl" style="color: white;"></i>
                    <div class="longest-streak-content">
                        <div class="longest-streak-number">${contributionStats.longestStreak || "0"}</div>
                        <p class="longest-streak-label">Longest Streak</p>
                    </div>
                </div>
            </div>

            <!-- Contribution Graph -->
            <div class="contribution-card">
                <div class="contribution-header">
                    <div class="contribution-title">
                        <i data-lucide="calendar" class="icon text-green-400"></i>
                        <h3>Contribution Graph</h3>
                    </div>
                    <div class="contribution-legend">
                        <span>Less</span>
                        <div class="legend-dots">
                            <div class="legend-dot" style="background-color: #0d1117;"></div>
                            <div class="legend-dot" style="background-color: #0e4429;"></div>
                            <div class="legend-dot" style="background-color: #006d32;"></div>
                            <div class="legend-dot" style="background-color: #26a641;"></div>
                            <div class="legend-dot" style="background-color: #39d353;"></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>
                <div class="contribution-graph">
                    ${graphSVG || '<div style="text-align: center; color: #9ca3af; padding: 40px;">Loading contribution graph...</div>'}
                </div>
            </div>

            <!-- Branding -->
            <div class="branding">
                <div class="branding-card">
                    <p class="branding-text">
                        Powered by <span class="branding-highlight">Open Dev Society</span>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Initialize Lucide icons
        lucide.createIcons();
    </script>
</body>
</html>`;
}

function generateMinimalHTML(data: any): string {
    const { name, githubURL, imageUrl, userStats, contributionStats } = data;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Open Readme - Minimal</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 40px;
        background: white;
        color: #1f2937;
        width: 800px;
        height: 600px;
        box-sizing: border-box;
      }
      .container {
        max-width: 720px;
        margin: 0 auto;
        text-align: center;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .profile-img {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        margin: 0 auto 24px auto;
        object-fit: cover;
      }
      .name {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .username {
        font-size: 1.25rem;
        color: #6b7280;
        margin-bottom: 48px;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
        margin-bottom: 48px;
      }
      .stat-card {
        padding: 24px;
        background: #f9fafb;
        border-radius: 12px;
        text-align: center;
      }
      .stat-number {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .stat-label {
        font-size: 0.875rem;
        color: #6b7280;
      }
      .blue { color: #3b82f6; }
      .green { color: #10b981; }
      .purple { color: #8b5cf6; }
      .orange { color: #f59e0b; }
      .footer {
        font-size: 0.875rem;
        color: #6b7280;
      }
      .footer strong {
        font-weight: 600;
      }
    </style>
</head>
<body>
    <div class="container">
      ${imageUrl ? `<img src="${imageUrl}" alt="${name}" class="profile-img" />` : ''}
      <h1 class="name">${name || "Your Name"}</h1>
      <p class="username">@${githubURL || "username"}</p>

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

      <p class="footer">
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
      return generateBentoHTML(data); // fallback to bento
  }
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

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

            // Parallel data fetching with timeout
            const dataPromise = Promise.all([
                fetchUserData(g),
                fetchContributions(g),
                fetchYearContributions(g, currentYear)
            ]);

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
            args: [...chromium.default.args, '--disable-web-security'],
            defaultViewport: { width: 1200, height: 800 },
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
            defaultViewport: { width: 1200, height: 800 },
            headless: true,
        });
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 1.5 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Wait for fonts and icons to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const screenshot = await page.screenshot({
        type: "png",
        fullPage: false,
        clip: { x: 0, y: 0, width: 1200, height: 800 }
    }) as Buffer;

    await browser.close();

    // Log usage for direct requests
    logDirectUsage(g, theme);

    const endTime = Date.now();
    console.log(`✅ Returning ${theme} theme image for user: ${g} in ${endTime - startTime}ms`);

    // GitHub-friendly headers for 1-hour caching
    return new NextResponse(screenshot as BodyInit, {
        headers: {
            "Content-Type": "image/png",
            "Content-Length": screenshot.length.toString(),
            "Cache-Control": "public, max-age=3600, s-maxage=3600", // 1 hour cache
            "Expires": new Date(Date.now() + 3600000).toUTCString(), // 1 hour from now
            "Last-Modified": new Date().toUTCString(),
            "ETag": `"${Math.floor(Date.now() / 3600000)}"`, // Changes every hour
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "X-Content-Type-Options": "nosniff",
            "Vary": "Accept-Encoding",
            "X-Generated-For": g,
            "X-Generated-At": new Date().toISOString(),
            "X-Theme": theme,
            "X-Cache-Duration": "3600", // 1 hour indicator
            "X-Generation-Time": `${endTime - startTime}ms`,
        },
    });

  } catch (error: any) {
    const endTime = Date.now();
    console.error("💥 Direct image generation error:", error);
    return new NextResponse(JSON.stringify({
        error: "Failed to generate image",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
        duration: `${endTime - startTime}ms`,
    }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
    });
  }
}

// Remove POST method since we're focusing on direct GET requests
export async function POST(_req: NextRequest) {
    return NextResponse.json(
        { error: "Use GET method with direct=true parameter for auto-updating images" },
        { status: 405 }
    );
}
