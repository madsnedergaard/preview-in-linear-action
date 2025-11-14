import { getGitHubDeploymentData } from './github';

const providers = {
    netlify: {
        author: 'netlify[bot]',
        urlPattern: 'Deploy Preview.*?\\]\\((https://[^)]+\\.netlify\\.app)\\)',
    },
    cloudflare: {
        author: 'cloudflare-workers-and-pages[bot]',
        urlPattern: "Branch Preview URL[\\s\\S]*?href='(https://[^']+\\.pages\\.dev)'",
    },
    vercel: {
        author: 'vercel[bot]',
        urlPattern: '\\[Preview\\]\\((https://[^)]+\\.vercel\\.app)\\)',
    },
};

export const supportedProviders = ['vercel', 'netlify', 'cloudflare', 'github-deployments'] as const;

export async function getPreviewDataByProvider(
    provider: (typeof supportedProviders)[number],
    ghIssueNumber: number,
    comments: any[],
): Promise<{ url: string; avatar: string | undefined } | null> {
    if (provider === 'github-deployments' || provider === 'vercel') {
        return await getGitHubDeploymentData(ghIssueNumber);
    }
    if (provider === 'netlify') {
        return await getPreviewDataFromComments(comments, provider);
    }
    if (provider === 'cloudflare') {
        return await getPreviewDataFromComments(comments, provider);
    }
    return null;
}
export async function getPreviewDataFromComments(comments: any[], provider: keyof typeof providers) {
    for (const comment of comments) {
        if (comment.user?.login === providers[provider].author) {
            const link = comment.body?.match(new RegExp(providers[provider].urlPattern))?.[1];

            if (link) {
                return { url: link, avatar: comment.user?.avatar_url };
            } else {
                console.error(`No ${provider} link found in the comment`);
                return null;
            }
        }
    }
    console.error(`No ${provider} link found in the comments`);
    return null;
}
