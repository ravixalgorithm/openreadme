"use server";

import { fetchGitHubData } from "./fetchGithubData";

type ContributionDay = { date: string; contributionCount: number };
type Week = { contributionDays: ContributionDay[] };

export async function fetchYearContributions(
    username: string,
    year: number,
): Promise<ContributionDay[]> {
    const query = `
    query ($user: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $user) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

    const start = `${year}-01-01T00:00:00Z`;
    const end = `${year}-12-31T23:59:59Z`;

    const data = await fetchGitHubData(query, {
        user: username,
        from: start,
        to: end,
    });

    // Narrow the unknown response to the expected shape
    const typed = data as {
        data: {
            user: {
                contributionsCollection: {
                    contributionCalendar: {
                        weeks: Week[];
                    };
                };
            } | null;
        };
    };

    const weeks: Week[] = typed?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ?? [];

    // Aggregate all the contribution days from the year
    const contributionDays: ContributionDay[] = weeks.flatMap((week: Week) =>
        week.contributionDays.map((day: ContributionDay) => ({
            date: day.date,
            contributionCount: day.contributionCount,
        })),
    );

    return contributionDays;
}
