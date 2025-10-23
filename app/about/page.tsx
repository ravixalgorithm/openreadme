import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import Odsbranding from "@/components/Odsbranding";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Use existing Navbar component */}
            <Navbar />

            {/* Main Content */}
            <main className="pt-24 pb-16">
                <div className="max-w-6xl px-4 mx-auto sm:px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="relative mb-20 text-center">
                        <div className="absolute inset-0 -z-10">
                            <div className="absolute top-0 h-32 -translate-x-1/2 rounded-full left-1/2 w-96 bg-teal-500/10 blur-3xl" />
                        </div>
                        <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            About
                        </h1>
                        <p className="max-w-3xl mx-auto text-xl leading-relaxed text-muted-foreground">
                            Learn about Open Readme, the Open Dev Society initiative behind it, and the project lead{" "}
                            <span className="font-semibold text-foreground">@ravixalgorithm</span>.
                        </p>
                    </div>

                    {/* Content Grid */}
                    <div className="grid gap-20">
                        {/* Open Readme Section */}
                        <section className="grid items-center gap-12 lg:grid-cols-2">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold md:text-4xl">Open Readme</h2>
                                    <p className="text-lg leading-relaxed text-muted-foreground">
                                        A modern, themeable, open-source way to showcase your GitHub profile with a beautiful bento grid.
                                        Generate a shareable image and embed it in your README effortlessly.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <Button asChild size="lg" className="font-medium">
                                        <Link href="/guide">
                                            Read Guide
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="font-medium">
                                        <a href="https://github.com/open-dev-society/openreadme" target="_blank" rel="noreferrer">
                                            <Github className="mr-2 size-5" />
                                            GitHub
                                        </a>
                                    </Button>
                                </div>
                            </div>
                            <div className="order-first lg:order-last">
                                <div className="relative overflow-hidden shadow-2xl rounded-2xl bg-gradient-to-br from-muted/50 to-muted">
                                    <Image
                                        alt="Open Readme Preview"
                                        width={1280}
                                        height={720}
                                        src="/home.png"
                                        className="object-cover w-full h-auto"
                                        priority
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Open Dev Society Section */}
                        <section className="grid items-center gap-12 lg:grid-cols-2">
                            <div className="relative p-12 overflow-hidden shadow-xl rounded-2xl bg-gradient-to-br from-muted/30 to-muted/50">
                                <div className="flex items-center justify-center">
                                    <Odsbranding />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold md:text-4xl">Open Dev Society</h2>
                                    <p className="text-lg leading-relaxed text-muted-foreground">
                                        A community initiative focused on building open, transparent, and developer-first tools.
                                        Open Readme is proudly built under ODS to foster collaboration and innovation.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <Button asChild variant="outline" size="lg" className="font-medium">
                                        <Link href="https://github.com/open-dev-society/" target="_blank" rel="noreferrer">
                                            Visit Website
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" className="font-medium">
                                        <a href="https://github.com/open-dev-society/openreadme" target="_blank" rel="noreferrer">
                                            <Github className="mr-2 size-5" />
                                            Project Repo
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </section>

                        {/* Project Lead Section */}
                        <section className="p-8 bg-gradient-to-r from-muted/30 to-muted/10 rounded-3xl md:p-12">
                            <div className="grid items-center gap-12 lg:grid-cols-3">
                                <div className="space-y-6 lg:col-span-2">
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-bold md:text-4xl">
                                            Project Lead
                                        </h2>
                                        <div className="text-2xl font-semibold text-teal-500">
                                            @ravixalgorithm
                                        </div>
                                        <p className="text-lg leading-relaxed text-muted-foreground">
                                            Maintainer of Open Readme. Passionate about building delightful developer experiences
                                            and transparent tooling that empowers the open source community.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <Button asChild className="font-medium text-white bg-zinc-900 hover:bg-zinc-800" size="lg">
                                            <a href="https://github.com/ravixalgorithm" target="_blank" rel="noreferrer">
                                                <Github className="mr-2 size-5" />
                                                GitHub
                                            </a>
                                        </Button>
                                        <Button asChild className="font-medium text-white bg-blue-600 hover:bg-blue-700" size="lg">
                                            <a href="https://www.linkedin.com/in/ravixalgorithm" target="_blank" rel="noreferrer">
                                                <Linkedin className="mr-2 size-5" />
                                                LinkedIn
                                            </a>
                                        </Button>
                                        <Button asChild className="font-medium text-white bg-black hover:bg-zinc-900" size="lg">
                                            <a href="https://x.com/ravixalgorithm" target="_blank" rel="noreferrer">
                                                <Twitter className="mr-2 size-5" />
                                                Twitter
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                                <div className="order-first lg:order-last">
                                    <div className="relative overflow-hidden shadow-2xl rounded-2xl">
                                        <Image
                                            alt="ravixalgorithm avatar"
                                            width={400}
                                            height={400}
                                            src="https://avatars.githubusercontent.com/ravixalgorithm"
                                            className="object-cover w-full aspect-square"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
