import { context } from '@actions/github';
import { debug, getInput, info } from '@actions/core';

import { findLinearIdentifierInComment, getComments } from './github';
import { getLinearIssueId, setAttachment } from './linear';
import { getPreviewDataByProvider, supportedProviders, detectProvider } from './providers';

async function main() {
    debug(`Starting with context: ${JSON.stringify(context, null, 2)}`);

    // Only run if the comment is on a pull request
    if (!context.payload.issue?.pull_request) {
        // TODO: What about listening on deployment_status then? Can we expand this check to be
        // "if on:issue_comment" + "no payload.pull_request"?
        info('Skipping: comment is not on a pull request');
        return;
    }

    const ghIssueNumber = context.issue.number;
    const comments = await getComments(ghIssueNumber);

    // Get provider from input or auto-detect
    let provider: (typeof supportedProviders)[number] | undefined = getInput('provider') as
        | (typeof supportedProviders)[number]
        | undefined;

    if (!provider) {
        debug('No provider specified, attempting auto-detection...');
        const detectedProvider = await detectProvider(comments, ghIssueNumber);
        if (!detectedProvider) {
            throw new Error('Could not auto-detect provider. Please specify the provider input.');
        }
        debug(`Auto-detected provider: ${detectedProvider}`);
        provider = detectedProvider;
    } else {
        if (!supportedProviders.includes(provider)) {
            throw new Error(`Unsupported provider: ${provider}`);
        }
        debug(`Using provider: ${provider}`);
    }

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
