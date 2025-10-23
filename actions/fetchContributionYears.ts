"use server";

import { fetchGitHubData } from "./fetchGithubData";

export async function fetchContributionYears(
    username: string,
): Promise<number[]> {
    const query = `
    query ($user: String!) {
      user(login: $user) {
        contributionsCollection {
          contributionYears
        }
      }
    }
  `;

    const data = await fetchGitHubData(query, { user: username });

    // Type assertion to handle the 'unknown' type from fetchGitHubData
    const result = data as {
        data: {
            user: {
                contributionsCollection: {
                    contributionYears: number[]
                }
            }
        }
    };

    return result.data.user.contributionsCollection.contributionYears;
}
