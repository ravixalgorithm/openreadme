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
        padding: 20px;
        min-height: 100vh;
        box-sizing: border-box;
        background: #0a0a0a;
        color: white;
      }
      .main-container {
        width: 1200px;
        max-width: 1200px;
        margin: 0 auto;
        position: relative;
      }
      .grid-container {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 16px;
        min-height: 700px;
      }

      /* Hero Card - Enhanced */
      .hero-card {
        grid-column: span 3;
        grid-row: span 2;
        background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
        border-radius: 24px;
        padding: 32px;
        position: relative;
        overflow: hidden;
        transition: transform 0.3s ease;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      }
      .hero-card:hover {
        transform: scale(1.02);
      }
      .hero-card::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
      .hero-card::after {
        content: '';
        position: absolute;
        bottom: -50%;
        right: -50%;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        animation: pulse 2s infinite 1s;
      }

      /* Profile Card - Enhanced */
      .profile-card {
        grid-column: span 6;
        grid-row: span 3;
        border-radius: 24px;
        overflow: hidden;
        position: relative;
        background: #1f2937;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        transition: transform 0.3s ease;
      }
      .profile-card:hover {
        transform: scale(1.01);
      }
      .profile-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
        padding: 24px;
      }
      .profile-info-card {
        background: rgba(255,255,255,0.1);
        backdrop-filter: blur(8px);
        padding: 16px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.2);
      }

      /* Social Grid - Enhanced */
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
        overflow: hidden;
        transition: all 0.3s ease;
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.3);
      }
      .social-card:hover {
        transform: scale(1.02);
        box-shadow: 0 20px 40px -3px rgba(0, 0, 0, 0.4);
      }
      .social-card::before {
        content: '';
        position: absolute;
        top: -20px;
        right: -20px;
        width: 80px;
        height: 80px;
        opacity: 0.2;
        background-size: contain;
        background-repeat: no-repeat;
      }
      .twitter {
        background: linear-gradient(135deg, #38bdf8, #3b82f6);
      }
      .twitter::before {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z'/%3E%3C/svg%3E");
      }
      .linkedin {
        background: linear-gradient(135deg, #2563eb, #1e40af);
      }
      .linkedin::before {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/%3E%3C/svg%3E");
      }
      .portfolio {
        background: linear-gradient(135deg, #10b981, #059669);
      }
      .portfolio::before {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E");
      }

      /* Stats Cards - Enhanced */
      .stats-card {
        grid-column: span 4;
        grid-row: span 2;
        background: linear-gradient(135deg, #f59e0b, #dc2626);
        border-radius: 24px;
        padding: 32px;
        text-align: center;
        position: relative;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        transition: transform 0.3s ease;
      }
      .stats-card:hover {
        transform: scale(1.02);
      }
      .stats-card::before {
        content: '⭐';
        position: absolute;
        font-size: 4rem;
        top: 20%;
        right: 10%;
        opacity: 0.7;
        animation: float 3s ease-in-out infinite;
      }

      /* Mini Stats Grid */
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
        position: relative;
        overflow: hidden;
        transition: transform 0.3s ease;
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.3);
      }
      .mini-stat:hover {
        transform: scale(1.05);
      }
      .mini-stat::before {
        content: '';
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        opacity: 0.2;
        background-size: contain;
      }
      .commits {
        background: linear-gradient(135deg, #059669, #047857);
      }
      .commits::before {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M12 1v6m0 6v6m11-7h-6m-6 0H1'/%3E%3C/svg%3E");
      }
      .prs {
        background: linear-gradient(135deg, #a855f7, #ec4899);
      }
      .prs::before {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Ccircle cx='18' cy='18' r='3'/%3E%3Ccircle cx='6' cy='6' r='3'/%3E%3Cpath d='M6 21V9a9 9 0 0 0 9 9'/%3E%3C/svg%3E");
      }
      .followers {
        background: linear-gradient(135deg, #3b82f6, #6366f1);
      }
      .followers::before {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75'/%3E%3C/svg%3E");
      }
      .repos {
        background: linear-gradient(135deg, #0891b2, #06b6d4);
      }
      .repos::before {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M6 3v18l3-3 3 3 3-3 3 3V3'/%3E%3Cpath d='M8 8h8M8 12h8'/%3E%3C/svg%3E");
      }

      /* Streak Grid */
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
        position: relative;
        overflow: hidden;
        box-shadow: 0 20px 40px -3px rgba(0, 0, 0, 0.4);
      }
      .current-streak::before {
        content: '🔥';
        position: absolute;
        font-size: 3rem;
        top: 16px;
        right: 16px;
        animation: flicker 2s ease-in-out infinite alternate;
      }
      .longest-streak {
        background: linear-gradient(135deg, #eab308, #f59e0b);
        border-radius: 16px;
        padding: 16px;
        text-align: center;
        color: white;
        position: relative;
        overflow: hidden;
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.3);
      }
      .longest-streak::before {
        content: '🏆';
        position: absolute;
        font-size: 1.5rem;
        top: 8px;
        right: 8px;
        opacity: 0.7;
      }

      /* Activity Graph */
      .activity-graph {
        grid-column: span 12;
        background: linear-gradient(135deg, #1f2937, #374151);
        border-radius: 24px;
        padding: 24px;
        min-height: 160px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      }
      .graph-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .graph-title {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #10b981;
        font-size: 1.25rem;
        font-weight: 600;
      }
      .graph-badge {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
      }

      /* Branding */
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
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease;
      }
      .branding:hover {
        transform: rotate(0deg) scale(1.05);
      }

      /* Animations */
      @keyframes pulse {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(1.1); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes flicker {
        0% { opacity: 0.7; }
        100% { opacity: 1; }
      }

      /* Responsive adjustments */
      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
      }
    </style>
</head>
<body>
    <div class="main-container">
      <div class="grid-container">
        <!-- Hero Card -->
        <div class="hero-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <span style="font-size: 1.5rem;">✨</span>
            <div style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 500;">
              Developer
            </div>
          </div>
          <div style="position: relative; z-index: 10;">
            <p style="margin: 0 0 8px 0; font-size: 1.125rem; opacity: 0.9;">Hello, I'm</p>
            <h1 style="font-size: 2.5rem; font-weight: bold; margin: 0 0 12px 0; line-height: 1.1;">
              ${name || "Your Name"}
            </h1>
            <p style="opacity: 0.8; margin: 0; font-size: 0.9rem;">Building the future, one commit at a time</p>
          </div>
        </div>

        <!-- Profile Image -->
        <div class="profile-card">
          ${imageUrl ? `<img src="${imageUrl}" alt="${name || 'Profile'}" style="width: 100%; height: 100%; object-fit: cover;" />` : `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #6b7280, #4b5563);">
              <div style="text-align: center; color: #d1d5db;">
                <div style="font-size: 4rem; margin-bottom: 16px;">👤</div>
                <p style="font-size: 1.25rem; font-weight: 500; margin: 0 0 8px 0;">Add your profile image</p>
                <p style="font-size: 0.875rem; opacity: 0.75; margin: 0;">Upload an image URL in the form above</p>
              </div>
            </div>
          `}
          <div class="profile-overlay">
            <div class="profile-info-card">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <p style="margin: 0 0 4px 0; font-size: 0.875rem; opacity: 0.8;">GitHub Profile</p>
                  <p style="margin: 0; font-weight: 600;">@${githubURL || "username"}</p>
                </div>
                <div style="font-size: 1.5rem;">🐙</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Social Links -->
        <div class="social-grid">
          <div class="social-card twitter">
            <div style="position: relative; z-index: 10;">
              <p style="margin: 0 0 8px 0; opacity: 0.8; font-size: 0.875rem;">Follow me on</p>
              <p style="margin: 0; font-weight: 600; font-size: 1.125rem;">@${twitterURL || "twitter"}</p>
            </div>
          </div>
          <div class="social-card linkedin">
            <div style="position: relative; z-index: 10;">
              <p style="margin: 0 0 8px 0; opacity: 0.8; font-size: 0.875rem;">Connect on</p>
              <p style="margin: 0; font-weight: 600; font-size: 1.125rem;">${linkedinURL || "LinkedIn"}</p>
            </div>
          </div>
          <div class="social-card portfolio">
            <div style="position: relative; z-index: 10;">
              <p style="margin: 0 0 8px 0; opacity: 0.8; font-size: 0.875rem;">Visit</p>
              <p style="margin: 0; font-weight: 600; font-size: 1.125rem;">${portfolioUrl ? (portfolioUrl.startsWith("https://") ? portfolioUrl.replace("https://", "") : portfolioUrl) : "Portfolio"}</p>
            </div>
          </div>
        </div>

        <!-- Total Stars -->
        <div class="stats-card">
          <div style="position: relative; z-index: 10;">
            <h2 style="margin: 0 0 16px 0; font-size: 1.25rem; font-weight: 500;">Total Stars</h2>
            <div style="font-size: 4rem; font-weight: bold; margin: 16px 0;">${userStats["Star Earned"] || "0"}</div>
            <p style="margin: 0; opacity: 0.8;">Stars earned across repositories</p>
          </div>
        </div>

        <!-- Mini Stats -->
        <div class="mini-stats">
          <div class="mini-stat commits">
            <div style="position: relative; z-index: 10;">
              <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${userStats.Commits || "0"}</div>
              <p style="margin: 0; opacity: 0.8; font-size: 0.75rem;">Commits</p>
            </div>
          </div>
          <div class="mini-stat prs">
            <div style="position: relative; z-index: 10;">
              <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${userStats["Pull Requests"] || "0"}</div>
              <p style="margin: 0; opacity: 0.8; font-size: 0.75rem;">PRs</p>
            </div>
          </div>
          <div class="mini-stat followers">
            <div style="position: relative; z-index: 10;">
              <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${userStats.Followers || "0"}</div>
              <p style="margin: 0; opacity: 0.8; font-size: 0.75rem;">Followers</p>
            </div>
          </div>
          <div class="mini-stat repos">
            <div style="position: relative; z-index: 10;">
              <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 8px;">${userStats["Contributed To"] || "0"}</div>
              <p style="margin: 0; opacity: 0.8; font-size: 0.75rem;">Repos</p>
            </div>
          </div>
        </div>

        <!-- Streak Stats -->
        <div class="streak-grid">
          <div class="current-streak">
            <div style="position: relative; z-index: 10;">
              <p style="margin: 0 0 16px 0; font-weight: 500;">Current Streak</p>
              <div style="font-size: 4rem; font-weight: bold; margin-bottom: 8px;">${contributionStats.currentStreak || "0"}</div>
              <p style="margin: 0; opacity: 0.8;">days</p>
            </div>
          </div>
          <div class="longest-streak">
            <div style="position: relative; z-index: 10;">
              <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 4px;">${contributionStats.longestStreak || "0"}</div>
              <p style="margin: 0; opacity: 0.8; font-size: 0.75rem;">Longest Streak</p>
            </div>
          </div>
        </div>

        <!-- Activity Graph -->
        <div class="activity-graph">
          <div class="graph-header">
            <div class="graph-title">
              <span style="font-size: 1.5rem;">📊</span>
              <span>Activity Graph</span>
            </div>
            <div class="graph-badge">Last 12 months</div>
          </div>
          ${githubURL ? `<img src="https://github-readme-activity-graph.vercel.app/graph?username=${githubURL}&bg_color=1f2937&color=10b981&line=059669&point=34d399&area=true&hide_border=true" alt="Activity graph" style="width: 100%; height: 100px; border-radius: 12px;" />` : `
            <div style="display: flex; align-items: center; justify-content: center; height: 100px; background: #374151; border-radius: 12px;">
              <div style="text-align: center; color: #9ca3af;">
                <div style="font-size: 2rem; margin-bottom: 8px;">🐙</div>
                <p style="margin: 0; font-size: 0.875rem;">Enter GitHub username to see activity graph</p>
              </div>
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
