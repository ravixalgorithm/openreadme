import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Octokit } from "@octokit/rest";

const USER_PROFILES_PATH = path.join(process.cwd(), "data", "user-profiles.json");
const USER_MAPPING_PATH = path.join(process.cwd(), "data", "user-mapping.json");

// GitHub repository configuration
const REPO_OWNER = "Open-Dev-Society";
const REPO_NAME = "openreadme";

interface UserProfile {
  name: string;
  githubUsername: string;
  profilePic: string;
  twitterUsername: string;
  linkedinUsername: string;
  portfolioUrl: string;
}

type UserProfiles = Record<string, UserProfile>;
type UserMapping = Record<string, string>;

// Helper function to read user mapping
function readUserMapping(): UserMapping {
  try {
    const data = fs.readFileSync(USER_MAPPING_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading user mapping:", error);
    return {};
  }
}

// Helper function to read user profiles
function readUserProfiles(): UserProfiles {
  try {
    const data = fs.readFileSync(USER_PROFILES_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading user profiles:", error);
    return {};
  }
}

// Helper function to write user profiles (local only)
function writeUserProfilesLocal(profiles: UserProfiles): void {
  try {
    fs.writeFileSync(USER_PROFILES_PATH, JSON.stringify(profiles, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing user profiles locally:", error);
    // Don't throw in production, just log
  }
}

// Helper function to update file in GitHub repository
async function updateGitHubFile(
  filePath: string,
  content: string,
  commitMessage: string
): Promise<void> {
  try {
    const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN_IMAGES;
    if (!githubToken) {
      console.warn("⚠️ GitHub token not configured, skipping GitHub update");
      return;
    }

    const octokit = new Octokit({ auth: githubToken });

    // Get current file to get its SHA
    let currentSha = "";
    try {
      const { data } = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: filePath,
      });

      if (!Array.isArray(data) && "sha" in data) {
        currentSha = data.sha;
      }
    } catch (error) {
      console.log(`File ${filePath} doesn't exist yet, will create it`);
    }

    // Update or create the file
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      message: commitMessage,
      content: Buffer.from(content).toString("base64"),
      sha: currentSha || undefined,
    });

    console.log(`✅ Updated ${filePath} in GitHub repository`);
  } catch (error) {
    console.error(`❌ Failed to update ${filePath} in GitHub:`, error);
    throw error;
  }
}

// GET: Retrieve user profile by username
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const profiles = readUserProfiles();
    const userProfile = profiles[username];

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile: userProfile }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/user-profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to write user mapping (local only)
function writeUserMappingLocal(mapping: UserMapping): void {
  try {
    fs.writeFileSync(USER_MAPPING_PATH, JSON.stringify(mapping, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing user mapping locally:", error);
    // Don't throw in production, just log
  }
}

// Helper function to generate hash ID
function generateHashId(username: string): string {
  return crypto.createHash('sha256').update(username.toLowerCase()).digest('hex').substring(0, 12);
}

// POST: Save or update user profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, name, profilePic, twitterUsername, linkedinUsername, portfolioUrl } = body;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Read current mappings and profiles
    const userMapping = readUserMapping();
    const profiles = readUserProfiles();

    // If user doesn't exist in mapping, add them with a generated hash ID
    let mappingUpdated = false;
    if (!userMapping[username]) {
      const hashId = generateHashId(username);
      userMapping[username] = hashId;
      mappingUpdated = true;
      console.log(`✅ Added new user to mapping: ${username} -> ${hashId}`);
    }

    // Save or update user profile
    profiles[username] = {
      name: name || "",
      githubUsername: username,
      profilePic: profilePic || "",
      twitterUsername: twitterUsername || "",
      linkedinUsername: linkedinUsername || "",
      portfolioUrl: portfolioUrl || "",
    };

    // Write to local files (for development)
    writeUserProfilesLocal(profiles);
    if (mappingUpdated) {
      writeUserMappingLocal(userMapping);
    }

    // Write to GitHub repository (for production)
    try {
      await updateGitHubFile(
        "data/user-profiles.json",
        JSON.stringify(profiles, null, 2),
        `chore: update profile for ${username}`
      );

      if (mappingUpdated) {
        await updateGitHubFile(
          "data/user-mapping.json",
          JSON.stringify(userMapping, null, 2),
          `chore: add mapping for ${username}`
        );
      }
    } catch (githubError) {
      console.error("Failed to update GitHub files:", githubError);
      // Continue anyway - local files are updated
    }

    return NextResponse.json(
      { message: "Profile saved successfully", profile: profiles[username] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/user-profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
