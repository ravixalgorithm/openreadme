import { randomBytes } from "crypto";

export const calculateTotalContributions = (
    contributionDays: { date: string; contributionCount: number }[],
): { total: number; firstContributionDate: string | null } => {
    const total = contributionDays.reduce(
        (total, day) => total + day.contributionCount,
        0,
    );
    const firstContributionDate =
        contributionDays.find((day) => day.contributionCount > 0)?.date || null;
    return { total, firstContributionDate };
};

export const calculateLongestStreak = (
    contributionDays: { date: string; contributionCount: number }[],
): {
    longestStreak: number;
    startDate: string | null;
    endDate: string | null;
} => {
    let longestStreak = 0,
        tempStreak = 0;
    let lastDate: Date | null = null;
    let streakStartDate: string | null = null,
        streakEndDate: string | null = null;
    let longestStartDate: string | null = null,
        longestEndDate: string | null = null;

    for (const day of contributionDays) {
        const currentDate = new Date(day.date);

        if (day.contributionCount > 0) {
            if (!tempStreak) streakStartDate = day.date; // Start tracking streak
            if (lastDate) {
                const dayDifference =
                    (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
                if (dayDifference === 1) {
                    tempStreak++;
                    streakEndDate = day.date; // Update streak end date
                } else {
                    if (tempStreak > longestStreak) {
                        longestStreak = tempStreak;
                        longestStartDate = streakStartDate;
                        longestEndDate = streakEndDate;
                    }
                    tempStreak = 1; // Reset streak
                    streakStartDate = day.date;
                    streakEndDate = day.date;
                }
            } else {
                tempStreak = 1; // Start streak if it's the first contribution
                streakStartDate = day.date;
                streakEndDate = day.date;
            }
            lastDate = currentDate;
        } else {
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
                longestStartDate = streakStartDate;
                longestEndDate = streakEndDate;
            }
            tempStreak = 0;
        }
    }

    if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
        longestStartDate = streakStartDate;
        longestEndDate = streakEndDate;
    }

    return {
        longestStreak,
        startDate: longestStartDate,
        endDate: longestEndDate,
    };
};

export const calculateCurrentStreak = (
    contributionDays: { date: string; contributionCount: number }[],
): {
    currentStreak: number;
    startDate: string | null;
    endDate: string | null;
} => {
    let currentStreak = 0;
    let streakStartDate: string | null = null;
    let streakEndDate: string | null = null;
    let lastDate = new Date(); // Start from today

    // Loop from the most recent day backwards
    for (let i = contributionDays.length - 1; i >= 0; i--) {
        const currentDate = new Date(contributionDays[i].date);
        const dayDifference =
            (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);

        if (contributionDays[i].contributionCount > 0 && dayDifference <= 1) {
            if (!currentStreak) streakStartDate = contributionDays[i].date; // Start tracking the current streak
            currentStreak++;
            streakEndDate = contributionDays[i].date; // Update the current streak end date
            lastDate = currentDate; // Update lastDate to the current one
        } else if (dayDifference > 1) {
            break; // Streak is broken due to a gap in consecutive days
        }
    }

    return { currentStreak, startDate: streakStartDate, endDate: streakEndDate };
};

export const formatDate = (dateString: string | null): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
    };

    // If the year is not the current year, include the year in the format
    if (date.getFullYear() !== new Date().getFullYear()) {
        options.year = "numeric";
    }

    return date.toLocaleDateString("en-US", options);
};

export function generateRandomString(length: number) {
    return randomBytes(Math.ceil(length / 2))
        .toString("hex")
        .slice(0, length);
}