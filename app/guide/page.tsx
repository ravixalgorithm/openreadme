"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
    Check,
    CirclePlay,
    Download,
    File,
    Menu,
    Settings,
    X,
    ArrowUp,
} from "lucide-react";
import Link from "next/link";
import { Spotlight } from "@/components/ui/Spotlight";
import Image from "next/image";
import { Tree } from "@/components/Tree";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export default function Component() {
    const { scrollYProgress } = useScroll();
    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("");
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll("section");
            let currentSection = "";

            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (
                    window.pageYOffset >= sectionTop - 100 &&
                    window.pageYOffset < sectionTop + sectionHeight - 100
                ) {
                    currentSection = section.id;
                }
            });
            setActiveSection(currentSection);
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { id: "introduction", title: "Introduction" },
        { id: "original-concept", title: "Original Concept & Inspiration", highlight: true },
        { id: "get-your-open-readme", title: "Get your Open Readme" },
        { id: "after-you-have-generated-your-image", title: "After Image Generation" },
        { id: "github-settings", title: "GitHub Settings" },
        { id: "finale", title: "Finale" },
    ];

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
            {/* Use existing Navbar */}
            <Navbar />

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <Spotlight
                    className="left-0 -top-40 md:left-60 md:-top-20"
                    fill="#fc32327e"
                />
                <div className="px-4 pt-24 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h1 className="mb-6 text-4xl font-bold text-transparent sm:text-6xl lg:text-7xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            Open Readme Docs
                        </h1>
                        <p className="max-w-3xl mx-auto text-xl leading-relaxed sm:text-2xl text-muted-foreground">
                            Welcome to the official documentation for{" "}
                            <span className="px-3 py-1 font-semibold rounded-lg bg-primary/20 text-primary">
                                Open Readme
                            </span>
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="px-4 pb-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="relative flex gap-8 lg:gap-12">
                    {/* Main Content */}
                    <main className="flex-1 max-w-4xl">
                        {/* Introduction Section */}
                        <section id="introduction" className="mb-20 scroll-mt-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-8"
                            >
                                <div className="p-8 bg-gradient-to-r from-muted/30 to-muted/10 rounded-2xl">
                                    <p className="mb-8 text-lg leading-relaxed sm:text-xl text-muted-foreground">
                                        Hey there, GitHub superstar! Ready to give your profile some
                                        serious swagger? With Open Readme, you'll turn your profile
                                        into a dynamic, eye-catching showcase that updates
                                        automatically with your latest GitHub stats.
                                    </p>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {[
                                            "Customizable grid layout",
                                            "Automatic stat updates",
                                            "Easy setup files",
                                            "1-click download",
                                            "Mobile responsive",
                                            "More features coming!",
                                        ].map((text, index) => (
                                            <motion.div
                                                key={text}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                className="flex items-center gap-3 text-base sm:text-lg"
                                            >
                                                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                                {text}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        <section id="original-concept" className="mb-20 scroll-mt-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                                    Original Concept & Inspiration
                                </h2>
                                <div className="p-8 border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 dark:border-purple-800 rounded-2xl">
                                    <div className="space-y-6">
                                        <p className="text-lg leading-relaxed text-purple-900 dark:text-purple-100">
                                            Open Readme is inspired by the amazing concept from{" "}
                                            <a
                                                href="https://opbento.edgexhq.tech"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-semibold text-purple-600 underline transition-colors dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 decoration-2 underline-offset-2"
                                            >
                                                OpBento by EdgeX HQ
                                            </a>
                                            . This incredible project sparked the idea to create an open-source alternative
                                            that developers could freely use, customize, and contribute to.
                                        </p>

                                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                                <span className="font-medium text-purple-900 dark:text-purple-100">
                                                    Built under Open Dev Society
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                                                <span className="font-medium text-purple-900 dark:text-purple-100">
                                                    Community-driven development
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6 border bg-white/50 dark:bg-black/20 rounded-xl border-purple-200/50 dark:border-purple-700/50">
                                            <p className="text-base leading-relaxed text-purple-800 dark:text-purple-200">
                                                <strong>Why Open Source?</strong> We believe amazing tools should be accessible to everyone.
                                                By making Open Readme open source, we're empowering the developer community to build,
                                                customize, and improve upon this concept together.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            <Button asChild className="text-white bg-purple-600 hover:bg-purple-700">
                                                <a href="https://opbento.edgexhq.tech" target="_blank" rel="noopener noreferrer">
                                                    Visit OpBento (Original Inspiration)
                                                </a>
                                            </Button>
                                            <Button asChild variant="outline" className="text-purple-700 border-purple-300 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-950/30">
                                                <a href="https://github.com/ravixalgorithm/openreadme" target="_blank" rel="noopener noreferrer">
                                                    <Github className="w-4 h-4 mr-2" />
                                                    Open Readme Repository
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* Get Your Open Readme Section */}
                        <section id="get-your-open-readme" className="mb-20 scroll-mt-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                                    Get Your Open Readme
                                </h2>
                                <p className="text-lg leading-relaxed text-muted-foreground">
                                    Fill out the bio section with the information you want displayed.
                                </p>
                                <div className="relative overflow-hidden shadow-2xl rounded-2xl">
                                    <Image
                                        src="/guide1.png"
                                        alt="Open Readme Generation Interface"
                                        width={1200}
                                        height={700}
                                        className="object-cover w-full"
                                        priority
                                    />
                                </div>
                                <div className="p-6 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 rounded-xl">
                                    <p className="text-lg text-blue-900 dark:text-blue-100">
                                        Click on the{" "}
                                        <button className="inline-flex items-center justify-center h-10 px-4 py-2 mx-2 text-sm font-medium rounded-md whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90">
                                            Generate Image
                                        </button>
                                        button. And Voila! This will generate a new image for you.
                                    </p>
                                </div>
                            </motion.div>
                        </section>

                        {/* After Generation Section */}
                        <section id="after-you-have-generated-your-image" className="mb-20 scroll-mt-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                                    After Image Generation
                                </h2>
                                <div className="space-y-6">
                                    <p className="text-lg leading-relaxed text-muted-foreground">
                                        Once you have generated your image, you will receive an embed link
                                        for your GitHub README.md, along with two essential setup files:
                                    </p>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="flex items-center p-4 space-x-4 border bg-secondary/30 border-secondary rounded-xl">
                                            <Image
                                                width={24}
                                                height={24}
                                                src="/typescript.svg"
                                                alt="TypeScript"
                                                className="w-6 h-6"
                                            />
                                            <span className="flex-1 font-medium">get-openreadme.ts</span>
                                            <Download className="w-5 h-5 text-emerald-500" />
                                        </div>

                                        <div className="flex items-center p-4 space-x-4 border bg-secondary/30 border-secondary rounded-xl">
                                            <File className="w-6 h-6 text-red-500" />
                                            <span className="flex-1 font-medium">update-openreadme.yml</span>
                                            <Download className="w-5 h-5 text-emerald-500" />
                                        </div>
                                    </div>

                                    <div className="p-6 border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 rounded-xl">
                                        <p className="text-amber-900 dark:text-amber-100">
                                            <strong>Important:</strong> Do not change the file names.
                                            The setup will not work if you rename these files.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-lg text-muted-foreground">
                                            Create the following folder structure in your repository:
                                        </p>
                                        <div className="p-6 bg-muted/20 rounded-xl w-fit">
                                            <Tree contentTree="Your Repository">
                                                <Tree contentTree="README.md" />
                                                <Tree contentTree="get-openreadme.ts" />
                                                <Tree contentTree=".github" defaultCollapsed={false}>
                                                    <Tree contentTree="workflows">
                                                        <Tree contentTree="update-openreadme.yml" />
                                                    </Tree>
                                                </Tree>
                                            </Tree>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* GitHub Settings Section */}
                        <section id="github-settings" className="mb-20 scroll-mt-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                                    Repository Settings
                                </h2>
                                <div className="space-y-6">
                                    <p className="text-lg leading-relaxed text-muted-foreground">
                                        Enable <strong>Write Permissions</strong> in your repository settings.
                                        This is required for the action to update your README automatically.
                                    </p>

                                    <nav className="flex items-center p-4 space-x-2 text-sm rounded-lg bg-muted/20">
                                        <div className="flex items-center font-medium text-red-500">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </div>
                                        <span className="text-muted-foreground">→</span>
                                        <div className="flex items-center text-muted-foreground">
                                            <CirclePlay className="w-4 h-4 mr-2" />
                                            Actions
                                        </div>
                                        <span className="text-muted-foreground">→</span>
                                        <span className="text-muted-foreground">General</span>
                                    </nav>

                                    <div className="relative overflow-hidden shadow-2xl rounded-2xl">
                                        <Image
                                            width={1200}
                                            height={800}
                                            src="/guide2.png"
                                            alt="GitHub Actions Settings"
                                            className="object-cover w-full"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* Finale Section */}
                        <section id="finale" className="mb-20 scroll-mt-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                                    And That's It! 🎉
                                </h2>
                                <div className="space-y-6">
                                    <p className="text-lg leading-relaxed text-muted-foreground">
                                        Congratulations on setting up Open Readme! Your GitHub profile now
                                        has a unique, eye-catching grid that showcases your projects,
                                        updates with your latest activity, and is ready to impress anyone who visits.
                                    </p>

                                    <div className="p-8 border bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border-emerald-200 dark:border-emerald-800 rounded-xl">
                                        <p className="text-lg text-center text-emerald-900 dark:text-emerald-100">
                                            If you found this guide helpful, please consider giving it a
                                            ⭐ on GitHub. It helps others discover the project and motivates
                                            continued development. Thank you! 🙏
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </section>
                    </main>

                    {/* Right Side Navigation - Centered */}
                    <aside className="hidden w-64 xl:block shrink-0">
                        <div className="sticky space-y-6 top-32">
                            <div className="text-sm font-medium text-muted-foreground">
                                On this page
                            </div>
                            <div className="relative">
                                <motion.div
                                    className="absolute left-0 w-[2px] bg-primary origin-top rounded-full"
                                    style={{ scaleY }}
                                />
                                <nav className="pl-4 space-y-2 border-l-2 border-muted">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className={`block text-sm transition-all duration-200 ${
                                                activeSection === item.id
                                                    ? item.highlight
                                                        ? "text-purple-600 dark:text-purple-400 font-medium -translate-x-1 opacity-100"
                                                        : "text-foreground font-medium -translate-x-1 opacity-100"
                                                    : item.highlight
                                                        ? "text-purple-500 dark:text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 opacity-80 hover:opacity-100"
                                                        : "text-muted-foreground hover:text-foreground opacity-50 hover:opacity-75"
                                            }`}
                                        >
                                            {item.title}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Navigation Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="fixed z-40 p-3 bg-black border-2 border-teal-500 rounded-full shadow-lg xl:hidden bottom-6 right-6"
                    >
                        <Menu className="w-6 h-6 text-teal-500" />
                    </button>

                    {/* Mobile Navigation Overlay */}
                    {isMenuOpen && (
                        <div className="fixed inset-0 z-50 xl:hidden bg-black/80" onClick={() => setIsMenuOpen(false)}>
                            <div className="fixed top-0 right-0 h-full p-6 bg-black border-l shadow-2xl w-80 border-teal-500/30" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-semibold text-white">Navigation</h3>
                                    <button onClick={() => setIsMenuOpen(false)}>
                                        <X className="w-6 h-6 text-teal-500" />
                                    </button>
                                </div>
                                <nav className="space-y-4">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className={`block text-base transition-all duration-200 ${
                                                activeSection === item.id
                                                    ? item.highlight
                                                        ? "text-purple-400 font-medium opacity-100"
                                                        : "text-teal-400 font-medium opacity-100"
                                                    : item.highlight
                                                        ? "text-purple-300 hover:text-purple-200 opacity-80 hover:opacity-100"
                                                        : "text-gray-400 hover:text-teal-300 opacity-70 hover:opacity-100"
                                            }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {item.title}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed z-40 p-3 transition-opacity duration-200 rounded-full shadow-lg bottom-6 left-6 bg-primary text-primary-foreground"
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
