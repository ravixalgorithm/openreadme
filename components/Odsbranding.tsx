"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ColorKey =
    | "color1"
    | "color2"
    | "color3"
    | "color4"
    | "color5"
    | "color6"
    | "color7"
    | "color8"
    | "color9"
    | "color10"
    | "color11"
    | "color12"
    | "color13"
    | "color14"
    | "color15"
    | "color16"
    | "color17";

type Colors = Record<ColorKey, string>;

const COLORS: Colors = {
    // --- Teal Shades (Analogous/Tints) ---
    color1: "#20B2AA", // TEAL_500 (Primary Action)
    color2: "#1A8F87", // TEAL_700 (Darker/Hover)
    color3: "#45C8C1", // TEAL_400
    color4: "#9CE8E4", // TEAL_200 (Light Highlight)
    color5: "#C4F1EF", // TEAL_100
    color6: "#127370", // TEAL_800 (Very Dark)

    // --- Neutrals (Grays/Monochrome) ---
    color7: "#FFFFFF", // NEUTRAL_WHITE (Background)
    color8: "#F0F0F0", // NEUTRAL_100 (Light Background/Cards)
    color9: "#D9D9D9", // NEUTRAL_300 (Borders/Dividers)
    color10: "#A3A3A3", // NEUTRAL_500 (Secondary Text/Icons)
    color11: "#525252", // NEUTRAL_700 (Dark Text)
    color12: "#1C1C1C", // NEUTRAL_900 (Main Text/Dark Background)

    // --- Accent/Status Colors (High Contrast) ---
    color13: "#FF8A00", // ACCENT_ORANGE (Complementary/Warning)
    color14: "#FF5C5C", // RED (Error/Destructive)
    color15: "#4CAF50", // GREEN (Success)

    // --- Extra Tints/Shades for Gradients/Charts ---
    color16: "#005C59", // TEAL_900
    color17: "#73D4D0", // TEAL_300
};

const svgOrder = [
    "svg1",
    "svg2",
    "svg3",
    "svg4",
    "svg3",
    "svg2",
    "svg1",
] as const;

type SvgKey = (typeof svgOrder)[number];

type Stop = {
    offset: number;
    stopColor: string;
};

type SvgState = {
    gradientTransform: string;
    stops: Stop[];
};

type SvgStates = Record<SvgKey, SvgState>;

const createStopsArray = (
    svgStates: SvgStates,
    svgOrder: readonly SvgKey[],
    maxStops: number,
): Stop[][] => {
    const stopsArray: Stop[][] = [];
    for (let i = 0; i < maxStops; i++) {
        const stopConfigurations = svgOrder.map((svgKey) => {
            const svg = svgStates[svgKey];
            return svg.stops[i] || svg.stops[svg.stops.length - 1];
        });
        stopsArray.push(stopConfigurations);
    }
    return stopsArray;
};

type GradientSvgProps = {
    className: string;
    isHovered: boolean;
    colors: Colors;
};

const GradientSvg: React.FC<GradientSvgProps> = ({
                                                     className,
                                                     isHovered,
                                                     colors,
                                                 }) => {
    const svgStates: SvgStates = {
        svg1: {
            gradientTransform:
                "translate(287.5 280) rotate(-29.0546) scale(689.807 1000)",
            stops: [
                { offset: 0, stopColor: colors.color1 },
                { offset: 0.188423, stopColor: colors.color2 },
                { offset: 0.260417, stopColor: colors.color3 },
                { offset: 0.328792, stopColor: colors.color4 },
                { offset: 0.328892, stopColor: colors.color5 },
                { offset: 0.328992, stopColor: colors.color1 },
                { offset: 0.442708, stopColor: colors.color6 },
                { offset: 0.537556, stopColor: colors.color7 },
                { offset: 0.631738, stopColor: colors.color1 },
                { offset: 0.725645, stopColor: colors.color8 },
                { offset: 0.817779, stopColor: colors.color9 },
                { offset: 0.84375, stopColor: colors.color10 },
                { offset: 0.90569, stopColor: colors.color1 },
                { offset: 1, stopColor: colors.color11 },
            ],
        },
        svg2: {
            gradientTransform:
                "translate(126.5 418.5) rotate(-64.756) scale(533.444 773.324)",
            stops: [
                { offset: 0, stopColor: colors.color1 },
                { offset: 0.104167, stopColor: colors.color12 },
                // replaced orange accent with teal tint
                { offset: 0.182292, stopColor: colors.color3 },
                { offset: 0.28125, stopColor: colors.color1 },
                { offset: 0.328792, stopColor: colors.color4 },
                { offset: 0.328892, stopColor: colors.color5 },
                { offset: 0.453125, stopColor: colors.color6 },
                { offset: 0.515625, stopColor: colors.color7 },
                { offset: 0.631738, stopColor: colors.color1 },
                { offset: 0.692708, stopColor: colors.color8 },
                // replaced red accent with lighter teal
                { offset: 0.75, stopColor: colors.color4 },
                { offset: 0.817708, stopColor: colors.color9 },
                { offset: 0.869792, stopColor: colors.color10 },
                { offset: 1, stopColor: colors.color1 },
            ],
        },
        svg3: {
            gradientTransform:
                "translate(264.5 339.5) rotate(-42.3022) scale(946.451 1372.05)",
            stops: [
                { offset: 0, stopColor: colors.color1 },
                { offset: 0.188423, stopColor: colors.color2 },
                { offset: 0.307292, stopColor: colors.color1 },
                { offset: 0.328792, stopColor: colors.color4 },
                { offset: 0.328892, stopColor: colors.color5 },
                { offset: 0.442708, stopColor: colors.color15 },
                { offset: 0.537556, stopColor: colors.color16 },
                { offset: 0.631738, stopColor: colors.color1 },
                { offset: 0.725645, stopColor: colors.color17 },
                { offset: 0.817779, stopColor: colors.color9 },
                { offset: 0.84375, stopColor: colors.color10 },
                { offset: 0.90569, stopColor: colors.color1 },
                { offset: 1, stopColor: colors.color11 },
            ],
        },
        svg4: {
            gradientTransform:
                "translate(860.5 420) rotate(-153.984) scale(957.528 1388.11)",
            stops: [
                { offset: 0.109375, stopColor: colors.color11 },
                { offset: 0.171875, stopColor: colors.color2 },
                // replaced orange accent with teal tint
                { offset: 0.260417, stopColor: colors.color3 },
                { offset: 0.328792, stopColor: colors.color4 },
                { offset: 0.328892, stopColor: colors.color5 },
                { offset: 0.328992, stopColor: colors.color1 },
                { offset: 0.442708, stopColor: colors.color6 },
                { offset: 0.515625, stopColor: colors.color7 },
                { offset: 0.631738, stopColor: colors.color1 },
                { offset: 0.692708, stopColor: colors.color8 },
                { offset: 0.817708, stopColor: colors.color9 },
                { offset: 0.869792, stopColor: colors.color10 },
                { offset: 1, stopColor: colors.color11 },
            ],
        },
    };

    const maxStops = Math.max(
        ...Object.values(svgStates).map((svg) => svg.stops.length),
    );
    const stopsAnimationArray = createStopsArray(svgStates, svgOrder, maxStops);
    const gradientTransform = svgOrder.map(
        (svgKey) => svgStates[svgKey].gradientTransform,
    );

    const variants = {
        hovered: {
            gradientTransform: gradientTransform,
            transition: { duration: 50, repeat: Infinity, ease: "linear" as const },
        },
        notHovered: {
            gradientTransform: gradientTransform,
            transition: { duration: 10, repeat: Infinity, ease: "linear" as const },
        },
    };

    return (
        <svg
            className={className}
            width="1030"
            height="280"
            viewBox="0 0 1030 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                width="1030"
                height="280"
                rx="140"
                fill="url(#paint0_radial_905_231)"
            />
            <defs>
                <motion.radialGradient
                    id="paint0_radial_905_231"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    animate={isHovered ? variants.hovered : variants.notHovered}
                >
                    {stopsAnimationArray.map((stopConfigs, index) => (
                        <AnimatePresence key={index}>
                            <motion.stop
                                initial={{
                                    offset: stopConfigs[0].offset,
                                    stopColor: stopConfigs[0].stopColor,
                                }}
                                animate={{
                                    offset: stopConfigs.map((config) => config.offset),
                                    stopColor: stopConfigs.map((config) => config.stopColor),
                                }}
                                transition={{
                                    duration: 0,
                                    ease: "linear",
                                    repeat: Infinity,
                                }}
                            />
                        </AnimatePresence>
                    ))}
                </motion.radialGradient>
            </defs>
        </svg>
    );
};

type LiquidProps = {
    isHovered: boolean;
    colors: Colors;
};

const Liquid: React.FC<LiquidProps> = ({ isHovered, colors }) => {
    return (
        <>
            {Array.from({ length: 7 }).map((_, index) => (
                <div
                    key={index}
                    className={`absolute ${
                        index < 3 ? "w-[443px] h-[121px]" : "w-[756px] h-[207px]"
                    } ${
                        index === 0
                            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
                            : index === 1
                                ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[164.971deg] mix-blend-difference"
                                : index === 2
                                    ? "top-1/2 left-1/2 -translate-x-[53%] -translate-y-[53%] rotate-[-11.61deg] mix-blend-difference"
                                    : index === 3
                                        ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-[57%] rotate-[-179.012deg] mix-blend-difference"
                                        : index === 4
                                            ? "top-1/2 left-1/2 -translate-x-[57%] -translate-y-1/2 rotate-[-29.722deg] mix-blend-difference"
                                            : index === 5
                                                ? "top-1/2 left-1/2 -translate-x-[62%] -translate-y-[24%] rotate-[160.227deg] mix-blend-difference"
                                                : "top-1/2 left-1/2 -translate-x-[67%] -translate-y-[29%] rotate-180 mix-blend-hard-light"
                    }`}
                >
                    <GradientSvg
                        className="w-full h-full"
                        isHovered={isHovered}
                        colors={colors}
                    />
                </div>
            ))}
        </>
    );
};

const Odsbranding: React.FC = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="flex justify-center">
            <a
                href="https://github.com/open-dev-society"
                target="_blank"
                className="relative text-3xl inline-block w-64 h-[1.2em] mx-auto group dark:bg-black bg-white dark:border-white border-black border-2 rounded-lg"
            >
                <div className="absolute w-[112.81%] h-[128.57%] top-[8.57%] left-1/2 -translate-x-1/2 filter blur-[19px] opacity-70">
                    <span className="absolute inset-0 rounded-lg bg-[#C4F1EF] filter blur-[6.5px]"></span>
                    <div className="relative w-full h-full overflow-hidden rounded-lg">
                        <Liquid isHovered={isHovered} colors={COLORS} />
                    </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92.23%] h-[112.85%] rounded-lg bg-teal-700 filter blur-[7.3px]"></div>
                <div className="relative w-full h-full overflow-hidden rounded-lg">
                    <span className="absolute inset-0 rounded-lg bg-[#C4F1EF]"></span>
                    <span className="absolute inset-0 rounded-lg bg-[#0b1616]"></span>
                    <Liquid isHovered={isHovered} colors={COLORS} />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <span
                            key={i}
                            className={`absolute inset-0 rounded-lg border-solid border-[3px] border-gradient-to-b from-transparent to-white mix-blend-overlay filter ${
                                i <= 2 ? "blur-[3px]" : i === 3 ? "blur-[5px]" : "blur-[4px]"
                            }`}
                        ></span>
                    ))}
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] w-[70.8%] h-[42.85%] rounded-lg filter blur-[15px] bg-teal-600"></span>
                    <span className="absolute flex  items-center justify-between px-4 gap-2  top-[7%] left-[5%] w-[90%] h-[85%] rounded-lg text-white text-xl font-semibold tracking-wide whitespace-nowrap">
                        Open Dev Society
                    </span>
                </div>
                <button
                    className="absolute inset-0 bg-transparent rounded-lg cursor-pointer"
                    aria-label="Get Started"
                    type="button"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                ></button>
            </a>
        </div>
    );
};

export default Odsbranding;
