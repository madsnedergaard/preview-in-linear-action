import { context } from '@actions/github';
import { info } from '@actions/core';

import {
    getPreviewData,
    findLinearIdentifierInComment,
    getGitRef,
} from './github';
// import { getLinearIssueId, setAttachment } from './linear';

async function main() {
    const ghIssueNumber = context.issue.number;

    const gitRef = await getGitRef(ghIssueNumber);
    const previewData = await getPreviewData(gitRef);
    // TODO: Could we potentially get the linear identifier from context of the comment instead?
    // But maybe we want to actually have both, in case a preview provider adds a comment to the PR about a new deployment being available.
    const linearIdentifier = await findLinearIdentifierInComment(ghIssueNumber);

    info(JSON.stringify(previewData));
    info(JSON.stringify(linearIdentifier));
    // const issue = await getLinearIssueId(linearIdentifier);

    const title = context.payload.issue?.title;

    info(title);

    // TODO: Can we get the PR title from context?
    // await setAttachment({
    //     issueId: issue.id,
    //     url: previewData.url,
    //     title: `Preview of PR #${ghIssueNumber}`,
    //     subtitle: '',
    //     avatar: previewData.avatar,
    // });
}

main();
