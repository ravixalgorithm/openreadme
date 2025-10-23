"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import InputBlock from "@/components/InputBlock";
import { MainGenerator } from "@/components/readme-generator/MainGenerator";
import type { Graph, StreakStats, UserStats } from "@/types";

export default function DashboardPage() {
  const [name, setName] = useState("");
  const [githubURL, setGithubURL] = useState("");
  const [linkedinURL, setLinkedinURL] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [twitterURL, setTwitterURL] = useState("");
  const [portfolioURL, setPortfolioURL] = useState("");

  const [stats, setStats] = useState<UserStats | undefined>(undefined);
  const [streak, setStreak] = useState<StreakStats | undefined>(undefined);
  const [graph, setGraph] = useState<Graph[] | undefined>(undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Navbar />

      <div className="px-4 pt-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-transparent text-white sm:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Create Your Profile
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
            Fill in your details to generate a beautiful auto-updating GitHub profile README
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-12">
          <h2 className="flex items-center gap-2 mb-6 text-2xl font-semibold text-white">
            <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-teal-500 rounded-full">
              1
            </div>
            Your Information
          </h2>
          <div className="grid w-full grid-cols-12 gap-6 mx-auto max-w-7xl grid-flow-dense">
            <InputBlock
              setName={setName}
              setGithubURL={setGithubURL}
              setTwitterURL={setTwitterURL}
              setImageUrl={setImageUrl}
              setStats={setStats}
              setStreak={setStreak}
              setGraph={setGraph}
              setLinkedinURL={setLinkedinURL}
              setPortfolioURL={setPortfolioURL}
            />
          </div>
        </div>

        {/* Theme Selection & Generation Section */}
        <div className="mb-8">
          <h2 className="flex items-center gap-2 mb-6 text-2xl font-semibold text-white">
            <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-purple-500 rounded-full">
              2
            </div>
            Choose Theme & Generate
          </h2>

          <div className="p-4 border md:p-8 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl border-secondary">
            <MainGenerator
              name={name}
              githubURL={githubURL}
              twitterURL={twitterURL}
              linkedinURL={linkedinURL}
              imageUrl={imageUrl}
              stats={stats}
              streak={streak}
              graph={graph}
              portfolioUrl={portfolioURL}
            />
          </div>
        </div>

        {/* Instructions Section */}
        <div className="mb-12">
          <h2 className="flex items-center gap-2 mb-6 text-2xl font-semibold text-white">
            <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-green-500 rounded-full">
              3
            </div>
            How to Use
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 border border-gray-700 bg-gray-800/50 rounded-xl">
              <h3 className="mb-2 text-lg font-semibold text-white">1. Customize</h3>
              <p className="text-sm text-gray-400">
                Fill in your information and choose your favorite theme. Preview how it looks in real-time.
              </p>
            </div>

            <div className="p-6 border border-gray-700 bg-gray-800/50 rounded-xl">
              <h3 className="mb-2 text-lg font-semibold text-white">2. Generate</h3>
              <p className="text-sm text-gray-400">
                Click generate to create your auto-updating image URL. No setup required!
              </p>
            </div>

            <div className="p-6 border border-gray-700 bg-gray-800/50 rounded-xl">
              <h3 className="mb-2 text-lg font-semibold text-white">3. Copy & Paste</h3>
              <p className="text-sm text-gray-400">
                Copy the markdown code and paste it into your GitHub README.md file. It updates automatically!
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
