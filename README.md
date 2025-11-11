<center>
    <h1>Previews in Linear</h1>
    <p>Make it easy to access your previews in Linear with this GitHub Action.</p>
</center>

![Preview in Linear Action](./screenshot.png)

---

> [!IMPORTANT]
> This project is still under development and not ready for production use. Create an issue if you're interested in helping out or have any feedback.

## How it works

1. The action is triggered when a pull request gets linked to a Linear issue
2. It finds GitHub deployments on the pull request's branch
3. It finds the Linear issue associated with the pull request
4. It attaches the preview link to the Linear issue 🪄

### Supported providers

It supports any provider that use GitHub Deployments. The following have been tested and verified to work:

-   Vercel

## Getting started

TBD - the first one here is a crude PoC using API tokens instead of OAuth.

## Roadmap

-   Create the action and ensure it works as intended
-   Switch to using OAuth for authentication with both GitHub and Linear
-   Publish the action to the GitHub Marketplace
