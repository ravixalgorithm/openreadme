import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const USER_PROFILES_PATH = path.join(process.cwd(), "data", "user-profiles.json");
const USER_MAPPING_PATH = path.join(process.cwd(), "data", "user-mapping.json");

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

// Helper function to write user profiles
function writeUserProfiles(profiles: UserProfiles): void {
  try {
    fs.writeFileSync(USER_PROFILES_PATH, JSON.stringify(profiles, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing user profiles:", error);
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

    // Check if username exists in user-mapping.json
    const userMapping = readUserMapping();
    if (!userMapping[username]) {
      return NextResponse.json(
        { error: "Username not found in user mapping. Please contact admin to add your username first." },
        { status: 403 }
      );
    }

    const profiles = readUserProfiles();

    // Only update existing profile or create if username is in mapping
    profiles[username] = {
      name: name || "",
      githubUsername: username,
      profilePic: profilePic || "",
      twitterUsername: twitterUsername || "",
      linkedinUsername: linkedinUsername || "",
      portfolioUrl: portfolioUrl || "",
    };

    writeUserProfiles(profiles);

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
