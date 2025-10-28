/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
    Check,
    Menu,
    X,
    ArrowUp,
} from "lucide-react";
import Link from "next/link";
import { Spotlight } from "@/components/ui/Spotlight";
import Image from "next/image";
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
        { id: "getting-your-profile-image", title: "Getting Your Profile Image" },
        { id: "using-your-profile-image", title: "Using Your Profile Image" },
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
                        <h1 className="mb-6 text-4xl font-bold text-white sm:text-6xl lg:text-7xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            Open Readme Docs
                        </h1>
                        <p className="max-w-3xl mx-auto text-xl leading-relaxed sm:text-2xl text-muted-foreground">
                            Welcome to the official documentation for{" "}
                            <span className="px-3 py-1 font-semibold text-teal-500 rounded-lg bg-teal-500/20">
                                Open Readme
                            </span>
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="px-4 pb-20 mx-auto max-w-7xl sm:px-6 lg:px-8 overflow-hidden">
                <div className="relative flex flex-col xl:flex-row gap-8 lg:gap-12">
                    {/* Main Content */}
                    <main className="flex-1 w-full xl:max-w-4xl min-w-0">
                        {/* Introduction Section */}
                        <section id="introduction" className="mb-20 scroll-mt-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-8"
                            >
                                <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-r from-muted/30 to-muted/10 rounded-2xl overflow-hidden">
                                    <p className="mb-8 text-base leading-relaxed sm:text-lg md:text-xl text-muted-foreground break-words">
                                        Hey there, GitHub superstar! Ready to give your profile some
                                        serious swagger? With Open Readme, you'll turn your profile
                                        into a dynamic, eye-catching showcase that updates
                                        automatically with your latest GitHub stats.
                                    </p>
                                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
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
                                                className="flex items-center gap-3 text-base sm:text-lg break-words"
                                            >
                                                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                                {text}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* Original Concept Section*/}
                        <section id="original-concept" className="mb-20 scroll-mt-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl break-words">
                                    Original Concept & Inspiration
                                </h2>
                                <div className="p-4 sm:p-6 md:p-8 border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 dark:border-purple-800 rounded-2xl overflow-hidden">
                                    <div className="space-y-6">
                                        <p className="text-base sm:text-lg leading-relaxed text-purple-900 dark:text-purple-100 break-words">
                                            Open Readme is inspired by the amazing concept from{" "}
                                            <a
                                                href="https://opbento.edgexhq.tech"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-semibold text-purple-600 underline transition-colors dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 decoration-2 underline-offset-2 break-words"
                                            >
                                                OpBento by EdgeX HQ
                                            </a>
                                            . This incredible project sparked the idea to create an open-source alternative
                                            that developers could freely use, customize, and contribute to.
                                        </p>

                                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center flex-wrap">
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                                                <span className="font-medium text-purple-900 dark:text-purple-100 break-words">
                                                    Built under Open Dev Society
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <div className="w-3 h-3 bg-pink-500 rounded-full flex-shrink-0"></div>
                                                <span className="font-medium text-purple-900 dark:text-purple-100 break-words">
                                                    Community-driven development
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4 sm:p-6 border bg-white/50 dark:bg-black/20 rounded-xl border-purple-200/50 dark:border-purple-700/50 overflow-hidden">
                                            <p className="text-base leading-relaxed text-purple-800 dark:text-purple-200 break-words">
                                                <strong>Why Open Source?</strong> We believe amazing tools should be accessible to everyone.
                                                By making Open Readme open source, we're empowering the developer community to build,
                                                customize, and improve upon this concept together.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            <Button asChild className="text-white bg-purple-600 hover:bg-purple-700 text-sm sm:text-base">
                                                <a href="https://opbento.edgexhq.tech" target="_blank" rel="noopener noreferrer">
                                                    Visit OpBento (Original Inspiration)
                                                </a>
                                            </Button>
                                            <Button asChild variant="outline" className="text-purple-700 border-purple-300 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-950/30 text-sm sm:text-base">
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

                                <div className="space-y-6">
                                    <div className="p-4 sm:p-6 border border-teal-200 bg-teal-50 dark:bg-teal-950/20 dark:border-teal-800 rounded-xl overflow-hidden">
                                        <h3 className="mb-4 text-2xl font-semibold text-teal-900 dark:text-teal-100">
                                            Step 1: Fill Your Profile Information
                                        </h3>
                                        <p className="text-lg leading-relaxed text-teal-800 dark:text-teal-200 break-words">
                                            Navigate to the <Link href="/dashboard" className="font-semibold underline">Dashboard</Link> and fill in your details:
                                        </p>
                                        <ul className="mt-4 space-y-2 text-teal-800 dark:text-teal-200">
                                            <li className="flex items-start">
                                                <Check className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                                <span className="break-words"><strong>Name:</strong> Your display name</span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                                <span className="break-words"><strong>GitHub Username:</strong> Required for fetching your stats</span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                                <span className="break-words"><strong>Profile Picture URL:</strong> Custom image (optional, defaults to GitHub avatar)</span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                                <span className="break-words"><strong>Twitter Handle:</strong> Your Twitter/X username</span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                                <span className="break-words"><strong>LinkedIn Username:</strong> Your LinkedIn profile name</span>
                                            </li>
                                            <li className="flex items-start">
                                                <Check className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                                <span className="break-words"><strong>Portfolio URL:</strong> Your personal website or portfolio</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="relative overflow-hidden shadow-2xl rounded-2xl">
                                        <Image
                                            src="/guide1.png"
                                            alt="Open Readme Dashboard Interface"
                                            width={1200}
                                            height={700}
                                            className="object-cover w-full"
                                            priority
                                        />
                                    </div>

                                    <div className="p-4 sm:p-6 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 rounded-xl overflow-hidden">
                                        <h3 className="mb-3 text-xl font-semibold text-blue-900 dark:text-blue-100">
                                            Step 2: Save Your Data
                                        </h3>
                                        <p className="text-lg text-blue-900 dark:text-blue-100 break-words">
                                            Click the save button (💾) next to each field to save your information.
                                            Your data will be stored and used by our automated workflow to generate your profile image daily.
                                        </p>
                                    </div>

                                    <div className="p-4 sm:p-6 border border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800 rounded-xl overflow-hidden">
                                        <h3 className="mb-3 text-xl font-semibold text-purple-900 dark:text-purple-100">
                                            🤖 Automated Daily Updates
                                        </h3>
                                        <p className="text-lg text-purple-900 dark:text-purple-100 break-words">
                                            Once your profile is saved, our GitHub workflow automatically generates and updates
                                            your profile image <strong>every day at midnight UTC</strong> with your latest GitHub stats!
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* Getting Your Profile Image */}
                        <section id="getting-your-profile-image" className="mb-20 scroll-mt-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                                    Getting Your Profile Image
                                </h2>
                                <div className="space-y-6">
                                    <div className="p-4 sm:p-6 border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800 rounded-xl overflow-hidden">
                                        <h3 className="mb-3 text-xl font-semibold text-emerald-900 dark:text-emerald-100">
                                            📸 Your Profile Image URL
                                        </h3>
                                        <p className="mb-4 text-lg leading-relaxed text-emerald-800 dark:text-emerald-200 break-words">
                                            After saving your profile data, your image will be available at a static URL.
                                            You can find your unique image link in the dashboard after the first generation.
                                        </p>
                                        <div className="p-4 font-mono text-xs sm:text-sm bg-white rounded-lg dark:bg-black/40 overflow-x-auto">
                                            <code className="text-emerald-700 dark:text-emerald-300 break-all">
                                                https://raw.githubusercontent.com/ravixalgorithm/openreadme-images/main/[your-hash-id].png
                                            </code>
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-6 border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 rounded-xl overflow-hidden">
                                        <h3 className="mb-3 text-xl font-semibold text-blue-900 dark:text-blue-100">
                                            🔄 Automatic Updates
                                        </h3>
                                        <p className="text-lg text-blue-900 dark:text-blue-100 break-words">
                                            Your profile image updates automatically every day at midnight UTC.
                                            The URL stays the same, but the image content refreshes with your latest GitHub statistics!
                                        </p>
                                    </div>

                                    <div className="p-4 sm:p-6 border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden">
                                        <h3 className="mb-3 text-xl font-semibold text-amber-900 dark:text-amber-100">
                                            💡 Pro Tip
                                        </h3>
                                        <p className="text-amber-900 dark:text-amber-100 break-words">
                                            You can update your profile information (Twitter, LinkedIn, profile picture, etc.) anytime
                                            by going back to the dashboard and saving your changes. The workflow will use your updated
                                            data in the next daily generation.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* Using Your Profile Image Section */}
                        <section id="using-your-profile-image" className="mb-20 scroll-mt-24">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                                    Using Your Profile Image
                                </h2>
                                <div className="space-y-6">
                                    <p className="text-lg leading-relaxed text-muted-foreground break-words">
                                        Add your Open Readme profile image to your GitHub profile or any repository:
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex items-start p-3 sm:p-4 space-x-3 sm:space-x-4 border bg-secondary/30 border-secondary rounded-xl overflow-hidden">
                                            <div className="flex items-center justify-center w-8 h-8 text-white bg-teal-500 rounded-full shrink-0">
                                                1
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium break-words">Copy Your Image URL</p>
                                                <p className="text-sm text-muted-foreground break-words">Get your unique image URL from the dashboard after generation</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start p-3 sm:p-4 space-x-3 sm:space-x-4 border bg-secondary/30 border-secondary rounded-xl overflow-hidden">
                                            <div className="flex items-center justify-center w-8 h-8 text-white bg-teal-500 rounded-full shrink-0">
                                                2
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium break-words">Add to README.md</p>
                                                <p className="text-sm text-muted-foreground mb-3 break-words">
                                                    Use markdown to embed your image in any README file:
                                                </p>
                                                <div className="p-3 overflow-x-auto font-mono text-xs sm:text-sm bg-white rounded dark:bg-black/40">
                                                    <code className="text-purple-600 dark:text-purple-400 break-all">
                                                        ![Open Readme](https://raw.githubusercontent.com/ravixalgorithm/openreadme-images/main/[your-hash-id].png)
                                                    </code>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start p-3 sm:p-4 space-x-3 sm:space-x-4 border bg-secondary/30 border-secondary rounded-xl overflow-hidden">
                                            <div className="flex items-center justify-center w-8 h-8 text-white bg-teal-500 rounded-full shrink-0">
                                                3
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium break-words">Commit and Push</p>
                                                <p className="text-sm text-muted-foreground break-words">
                                                    Save your README.md and push to GitHub. Your profile image will display with automatic daily updates!
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-6 border border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-800 rounded-xl overflow-hidden">
                                        <h3 className="mb-3 text-xl font-semibold text-indigo-900 dark:text-indigo-100">
                                            🎨 Customization Options
                                        </h3>
                                        <p className="text-lg text-indigo-900 dark:text-indigo-100 break-words">
                                            Want to customize your profile theme? Visit the dashboard to select from multiple
                                            beautiful themes and see a live preview before saving!
                                        </p>
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
                                    <p className="text-lg leading-relaxed text-muted-foreground break-words">
                                        Congratulations on setting up Open Readme! Your GitHub profile now
                                        has a unique, eye-catching grid that showcases your projects,
                                        updates with your latest activity, and is ready to impress anyone who visits.
                                    </p>

                                    <div className="p-4 sm:p-6 md:p-8 border bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden">
                                        <p className="text-lg text-center text-emerald-900 dark:text-emerald-100 break-words">
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
                                    className="absolute left-0 w-[2px] bg-teal-500 origin-top rounded-full"
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
                    className="fixed z-40 p-3 transition-opacity duration-200 bg-transparent rounded-full shadow-lg bottom-6 left-6 text-teal-500 border border-teal-500"
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
