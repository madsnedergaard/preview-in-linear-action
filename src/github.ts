import github, { context } from '@actions/github';

async function getClient() {
    const API_TOKEN = process.env.GITHUB_TOKEN ?? '';
    return github.getOctokit(API_TOKEN);
}

export async function getGitRef(ghIssueNumber: number) {
    const octokit = await getClient();
    const pull = await octokit.rest.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: ghIssueNumber,
    });
    return pull.data.head.ref;
}

export async function getDeployment(ref: string) {
    const octokit = await getClient();

    const deployments = await octokit.rest.repos.listDeployments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref,
        // TODO: Should we add this filter to ensure we dont get a production deployment link?
        // Given that a new PR merge triggers a new SHA, it might not be needed
        // environment: 'preview',
    });
    const deployment = deployments.data[0];
    if (!deployment) {
        console.error('No deployment found for the ref');
        throw new Error('No deployment found for the ref');
    }
    if (deployments.data.length > 1) {
        console.error('Multiple deployments found for the same ref');
        throw new Error('Multiple deployments found for the same ref');
    }
    return deployment;
}

async function getDeploymentData(deploymentId: number) {
    const octokit = await getClient();
    const statuses = await octokit.rest.repos.listDeploymentStatuses({
        owner: context.repo.owner,
        repo: context.repo.repo,
        deployment_id: deploymentId,
    });
    const status = statuses.data[0];

    if (!status) {
        console.error('No deployment status found for the deployment');
        throw new Error('No deployment status found for the deployment');
    }
    if (status.state !== 'success') {
        console.error('Deployment status is not success');
        throw new Error('Deployment status is not success');
    }
    if (!status.environment_url) {
        console.error('No environment URL found for the deployment');
        throw new Error('No environment URL found for the deployment');
    }
    return { url: status.environment_url, avatar: status.creator?.avatar_url };
}

export async function getPreviewData(ref: string) {
    const deployment = await getDeployment(ref);
    const deploymentData = await getDeploymentData(deployment.id);
    return deploymentData;
}

export async function findLinearIdentifierInComment(ghIssueNumber: number) {
    // Find the relevant Linear issue comment inside the pull request from the bot
    const octokit = await getClient();
    const comments = await octokit.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: ghIssueNumber,
    });

    for (const comment of comments.data) {
        if (comment.user?.login === 'linear[bot]') {
            // Body example: <p><a href=\"https://linear.app/preview-test/issue/PRE-7/add-functionality-for-detecting-a-linear-identifier\">PRE-7 Add functionality for detecting a Linear identifier</a></p>
            const link = comment.body?.match(
                /https:\/\/linear\.app\/[^"]+/,
            )?.[0];

            if (link) {
                const parts = link
                    .replace('https://linear.app/', '')
                    .split('/');
                const [_team, _, identifier, _title] = parts;
                return identifier as string;
            } else {
                console.error('No link found in the comment');
                throw new Error('No link found in the comment');
            }
        }
    }
    console.error('No linear identifier found in the comment');
    throw new Error('No linear identifier found in the comment');
}
