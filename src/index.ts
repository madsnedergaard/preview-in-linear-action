import { context } from '@actions/github';
import { debug, getInput, info } from '@actions/core';

import { findLinearIdentifierInComment, getComments } from './github';
import { getLinearIssueId, setAttachment } from './linear';
import { getPreviewDataByProvider, supportedProviders } from './providers';

async function main() {
    debug(`Starting with context: ${JSON.stringify(context, null, 2)}`);
    const provider = getInput('provider', { required: true }) as (typeof supportedProviders)[number];
    if (!supportedProviders.includes(provider)) {
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Only run if the comment is on a pull request
    if (!context.payload.issue?.pull_request) {
        info('Skipping: comment is not on a pull request');
        return;
    }

    const ghIssueNumber = context.issue.number;

    const comments = await getComments(ghIssueNumber);

    const linearIdentifier = await findLinearIdentifierInComment(comments);
    if (!linearIdentifier) {
        info('Skipping: linear identifier not found');
        return;
    }
    const previewData = await getPreviewDataByProvider(provider, ghIssueNumber, comments);
    if (!previewData) {
        info('Skipping: preview data not found');
        return;
    }

    info(JSON.stringify(previewData));
    info(JSON.stringify(linearIdentifier));
    const issue = await getLinearIssueId(linearIdentifier);

    const title = context.payload.issue?.title;

    const attachment = await setAttachment({
        issueId: issue.id,
        url: previewData.url,
        title: `Preview of PR #${ghIssueNumber}`,
        subtitle: title,
        avatar: previewData.avatar,
    });
    info(`Added attachment: ${JSON.stringify(attachment)}`);
    info('Done running');
}

main();
