/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import {
    Activity,
    Calendar,
    Flame,
    GitBranch,
    Github,
    GitPullRequest,
    Linkedin,
    Star,
    Trophy,
    Twitter,
    Users,
    Globe,
    GitCommit,
    Sparkles,
} from "lucide-react";
import { Graph, StreakStats, UserStats } from "@/types";
import { generateContributionGraph } from "@/utils/generate-graph";
import Image from "next/image";
import { User } from "lucide-react";

const space = Space_Grotesk({
    subsets: ["latin"],
    weight: ["400", "300", "600", "700", "500"],
});

interface BentoClassicProps {
    name: string;
    githubURL: string;
    twitterURL: string;
    linkedinURL: string;
    imageUrl: string;
    stats: UserStats | undefined;
    streak: StreakStats | undefined;
    graph: Graph[] | undefined;
    portfolioUrl: string;
}

const BentoClassic = ({
    name,
    githubURL,
    twitterURL,
    linkedinURL,
    imageUrl,
    stats,
    streak,
    graph,
    portfolioUrl,
}: BentoClassicProps) => {
    const getColor = (value: number) => {
        switch (value) {
            case 0:
                return "#0d1117";
            case 1:
                return "#0e4429";
            case 2:
                return "#006d32";
            case 3:
                return "#26a641";
            case 4:
                return "#39d353";
            default:
                return "#161b22";
        }
    };

    return (
        <div className={cn("w-full md:max-w-7xl mx-auto md:px-4", space.className)}>
            <div className="relative grid w-full grid-cols-12 gap-4 mx-auto mb-8">
                {/* Hero/Name Card - Enhanced */}
                <div className="col-span-12 row-span-2 md:col-span-4 lg:col-span-3 group">
                    <div className="relative h-full min-h-[280px] p-8 overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 shadow-2xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
                        {/* Animated background elements */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 left-0 w-32 h-32 -translate-x-16 -translate-y-16 bg-white rounded-full animate-pulse"></div>
                            <div className="absolute bottom-0 right-0 w-40 h-40 delay-1000 translate-x-20 translate-y-20 bg-white rounded-full animate-pulse"></div>
                        </div>

                        <div className="relative z-10 flex flex-col justify-between h-full text-white">
                            <div className="flex items-center justify-between">
                                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                                <div className="px-3 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur">
                                    Developer
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-lg font-medium opacity-90">Hello, I'm</p>
                                <h1 className="text-4xl font-bold leading-tight">
                                    {name || "Your Name"}
                                </h1>
                                <p className="mt-3 text-white/80">
                                    Building the future, one commit at a time
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Image - Enhanced */}
                <div className="col-span-12 row-span-3 md:col-span-8 lg:col-span-6 group">
                    <div className="relative h-full min-h-[400px] overflow-hidden rounded-3xl shadow-2xl transform transition-all duration-300 hover:scale-[1.01]">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={name || "Profile"}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => {
                                    console.error("Image failed to load:", imageUrl);
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-800">
                                <div className="text-center text-gray-600 dark:text-gray-300">
                                    <User className="w-20 h-20 mx-auto mb-4" />
                                    <p className="text-lg font-medium">Add your profile image</p>
                                    <p className="mt-2 text-sm opacity-75">Upload an image URL in the form above</p>
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                        {/* Floating info card */}
                        <div className="absolute bottom-6 left-6 right-6">
                            <div className="p-4 border bg-white/10 backdrop-blur-md rounded-2xl border-white/20">
                                <div className="flex items-center justify-between text-white">
                                    <div>
                                        <p className="text-sm opacity-80">GitHub Profile</p>
                                        <p className="font-semibold">@{githubURL || "username"}</p>
                                    </div>
                                    <Github className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Links - Enhanced Grid */}
                <div className="grid grid-cols-1 col-span-12 row-span-3 gap-4 lg:col-span-3">
                    {/* Twitter */}
                    <a
                        href={twitterURL ? `https://twitter.com/${twitterURL}` : "#"}
                        className={`group relative h-full min-h-[120px] p-6 bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${!twitterURL ? 'pointer-events-none opacity-60' : ''}`}
                    >
                        <div className="absolute -top-4 -right-4 opacity-20">
                            <Twitter size={80} />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full text-white">
                            <Twitter className="w-6 h-6" />
                            <div>
                                <p className="text-sm opacity-80">Follow me on</p>
                                <p className="font-semibold">@{twitterURL || "twitter"}</p>
                            </div>
                        </div>
                    </a>

                    {/* LinkedIn */}
                    <a
                        href={linkedinURL ? `https://linkedin.com/in/${linkedinURL}` : "#"}
                        className={`group relative h-full min-h-[120px] p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${!linkedinURL ? 'pointer-events-none opacity-60' : ''}`}
                    >
                        <div className="absolute -top-4 -right-4 opacity-20">
                            <Linkedin size={80} />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full text-white">
                            <Linkedin className="w-6 h-6" />
                            <div>
                                <p className="text-sm opacity-80">Connect on</p>
                                <p className="font-semibold">{linkedinURL}</p>
                            </div>
                        </div>
                    </a>

                    {/* Portfolio */}
                    <a
                        href={portfolioUrl || "#"}
                        className={`group relative h-full min-h-[120px] p-6 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${!portfolioUrl ? 'pointer-events-none opacity-60' : ''}`}
                    >
                        <div className="absolute -top-4 -right-4 opacity-20">
                            <Globe size={80} />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full text-white">
                            <Globe className="w-6 h-6" />
                            <div>
                                <p className="text-sm opacity-80">Visit </p>
                                <p className="font-semibold truncate">{portfolioUrl}</p>
                            </div>
                        </div>
                    </a>
                </div>

                {/* GitHub Activity Graph - Enhanced */}
                <div className="col-span-12 row-span-1">
                    <div className="relative h-full min-h-[180px] p-4 bg-gradient-to-r from-gray-800 to-gray-800 rounded-3xl overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Activity className="w-6 h-6 text-green-400" />
                                <h3 className="text-xl font-semibold text-white">Activity Graph</h3>
                            </div>
                            <div className="px-3 py-1 text-xs font-medium text-green-400 rounded-full bg-green-400/10">
                                Last 12 months
                            </div>
                        </div>
                        {githubURL ? (
                            <Image
                                src={`https://github-readme-activity-graph.vercel.app/graph?username=${githubURL}&bg_color=1f2937&color=10b981&line=059669&point=34d399&area=true&hide_border=true`}
                                alt="Activity graph"
                                width={0}
                                height={0}
                                className="object-contain w-full h-full rounded-xl"
                                onError={(e) => {
                                    console.error("Activity graph failed to load");
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-24 bg-gray-700 rounded-xl">
                                <div className="text-center text-gray-400">
                                    <Github className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-sm">Enter GitHub username to see activity graph</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Grid - Enhanced */}
                {stats && (
                    <>
                        {/* Total Stars - Hero Card */}
                        <div className="col-span-12 row-span-2 md:col-span-6 lg:col-span-4">
                            <div className="relative h-full min-h-[200px] p-8 bg-gradient-to-br from-yellow-600 to-orange-700 rounded-3xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-[1.02]">
                                <div className="absolute inset-0 opacity-70">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`absolute w-8 h-8 text-yellow-300 animate-pulse`}
                                            style={{
                                                top: `${20 + i * 15}%`,
                                                left: `${10 + i * 20}%`,
                                                animationDelay: `${i * 0.5}s`
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="relative z-10 flex flex-col justify-between h-full text-white">
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-medium">Total Stars</span>
                                    </div>
                                    <div>
                                        <div className="mb-2 font-bold text-7xl">
                                            {stats["Star Earned"] || "0"}
                                        </div>
                                        <p className="text-white/80">Stars earned across repositories</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Mini Grid */}
                        <div className="grid grid-cols-2 col-span-12 row-span-2 gap-4 md:col-span-6 lg:col-span-4">
                            {/* Commits */}
                            <div className="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl">
                                <GitCommit className="absolute w-24 h-24 text-green-300 opacity-100 -top-2 right-2" />
                                <div className="relative z-10 text-white top-1/2">
                                    <div className="text-5xl font-bold">{stats.Commits || "0"}</div>
                                    <p className="text-xs opacity-80">Commits</p>
                                </div>
                            </div>

                            {/* Pull Requests */}
                            <div className="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                                <GitPullRequest className="absolute w-24 h-24 text-pink-300 opacity-100 top-2 right-2" />
                                <div className="relative z-10 text-white top-1/2">
                                    <div className="text-5xl font-bold">{stats["Pull Requests"] || "0"}</div>
                                    <p className="text-xs opacity-80">Pull Requests</p>
                                </div>
                            </div>

                            {/* Followers */}
                            <div className="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
                                <Users className="absolute w-24 h-24 text-white top-2 right-2 opacity-20" />
                                <div className="relative z-10 text-white top-1/2">
                                    <div className="text-5xl font-bold">{stats.Followers || "0"}</div>
                                    <p className="text-xs opacity-80">Followers</p>
                                </div>
                            </div>

                            {/* Contributed To */}
                            <div className="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl">
                                <GitBranch className="absolute w-24 h-24 text-white top-2 right-2 opacity-20" />
                                <div className="relative z-10 text-white top-1/2">
                                    <div className="text-5xl font-bold">{stats["Contributed To"] || "0"}</div>
                                    <p className="text-xs opacity-80">Contributed To</p>
                                </div>
                            </div>
                        </div>

                        {/* Streak Stats */}
                        <div className="grid col-span-12 grid-rows-3 row-span-2 gap-4 lg:col-span-4">
                            {/* Current Streak */}
                            <div className="relative row-span-2 p-6 overflow-hidden shadow-xl bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl">
                                <div className="absolute inset-0 text-orange-500 opacity-100 ">
                                    <Flame className="absolute w-24 h-24 top-4 right-4" />
                                </div>
                                <div className="relative z-10 flex flex-col justify-between h-full text-white">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Current Streak</span>
                                    </div>
                                    <div>
                                        <div className="mb-1 font-bold text-7xl">
                                            {streak?.currentStreak || "0"}
                                        </div>
                                        <p className="text-sm text-white/80">days</p>
                                    </div>
                                </div>
                            </div>

                            {/* Longest Streak */}
                            <div className="relative p-4 overflow-hidden shadow-lg bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl">
                                <Trophy className="absolute w-12 h-12 text-white opacity-100 top-2 right-2" />
                                <div className="relative z-10 text-white">
                                    <div className="text-3xl font-bold">{streak?.longestStreak || "0"}</div>
                                    <p className="text-xs opacity-80">Longest Streak</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Contribution Graph - Enhanced */}
                {graph && (
                    <div className="col-span-12 row-span-1">
                        <div className="relative h-full p-6 overflow-hidden shadow-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-6 h-6 text-green-400" />
                                    <h3 className="text-xl font-semibold text-white">
                                        Contribution Graph
                                    </h3>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <span>Less</span>
                                    <div className="flex gap-1">
                                        {[0, 1, 2, 3, 4].map((value) => (
                                            <div
                                                key={value}
                                                className="w-3 h-3 rounded-sm"
                                                style={{ backgroundColor: getColor(value) }}
                                            />
                                        ))}
                                    </div>
                                    <span>More</span>
                                </div>
                            </div>
                            <div
                                className="contribution-graph"
                                dangerouslySetInnerHTML={{
                                    __html: generateContributionGraph(graph),
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Open Dev Society Branding - Enhanced */}
                <div className="absolute z-20 -bottom-2 -right-2">
                    <div className="px-4 py-2 transition-all duration-300 transform shadow-lg bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl -rotate-3 hover:rotate-0 hover:scale-105">
                        <p className="text-xs font-medium text-white">
                            Powered by{" "}
                            <span className="font-bold">Open Dev Society</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BentoClassic;
