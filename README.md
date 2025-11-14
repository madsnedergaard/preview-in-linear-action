<h1 align="center">Previews in Linear</h1>
<p align="center">Make it easy to access your previews in Linear with this GitHub Action.</p>

<div align="center">

![Preview in Linear Action](./screenshot.png)

</div>

---

> [!IMPORTANT]
> This project is still under development and not ready for production use. Create an issue if you're interested in helping out or have any feedback.

## Usage

```yaml
name: Preview Links in Linear
# Run action when a new comment is added to a pull request (as we are expecting a Linear-bot comment with a link to the Linear issue)
on: [issue_comment, deployment_status]

jobs:
    preview-links-in-linear:
        # Ensures the action only runs on pull requests and not issues
        if: ${{ github.event.issue.pull_request }}
        name: Preview Links in Linear
        runs-on: ubuntu-latest
        steps:
            - name: Checkout
              uses: actions/checkout@v4
            - name: Attach preview link to Linear issue
              uses: madsnedergaard/preview-link-in-linear@main
              with:
                  provider: vercel # or netlify, cloudflare, github-deployments
                  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
                  LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}
```

## How it works

1. The action is triggered when a new comment is added to a pull request (as we are expecting a Linear-bot comment with a link to the Linear issue)
2. It finds GitHub deployments on the pull request's branch
3. It finds the Linear issue associated with the pull request from the comment
4. It attaches the preview link to the Linear issue 🪄

### Supported providers

It supports any provider that use GitHub Deployments. The following have been tested and verified to work:

- Vercel

## Getting started

TBD - the first one here is a crude PoC using API tokens instead of OAuth.

## Roadmap

- Switch to using OAuth for authentication with Linear
- Publish the action to the GitHub Marketplace
