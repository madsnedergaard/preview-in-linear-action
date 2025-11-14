import { describe, test, expect } from 'bun:test';
import { getPreviewDataFromComments } from './providers';

describe('Provider URL Patterns', () => {
    describe('Netlify', () => {
        test('should extract URL from Netlify deploy preview comment', async () => {
            const comment = {
                user: { login: 'netlify[bot]', avatar_url: 'https://example.com/avatar.png' },
                body: '### <span aria-hidden=\"true\">✅</span> Deploy Preview for *preview-testing-action* ready!\n\n\n|  Name | Link |\n|:-:|------------------------|\n|<span aria-hidden=\"true\">🔨</span> Latest commit | d069c322e5abf65998019f7561867a0786e4793e |\n|<span aria-hidden=\"true\">🔍</span> Latest deploy log | https://app.netlify.com/projects/preview-testing-action/deploys/69179e11d1b8e50008c2c798 |\n|<span aria-hidden=\"true\">😎</span> Deploy Preview | [https://deploy-preview-3--preview-testing-action.netlify.app](https://deploy-preview-3--preview-testing-action.netlify.app) |\n|<span aria-hidden=\"true\">📱</span> Preview on mobile | <details><summary> Toggle QR Code... </summary><br /><br />![QR Code](https://app.netlify.com/qr-code/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL2RlcGxveS1wcmV2aWV3LTMtLXByZXZpZXctdGVzdGluZy1hY3Rpb24ubmV0bGlmeS5hcHAifQ.Vt3BK938VOMqZ4YeqPbHHiQDMtpGw4vmQUuBBDYpY7E)<br /><br />_Use your smartphone camera to open QR code link._</details> |\n---\n<!-- [preview-testing-action Preview](https://deploy-preview-3--preview-testing-action.netlify.app) -->\n_To edit notification comments on pull requests, go to your [Netlify project configuration](https://app.netlify.com/projects/preview-testing-action/configuration/notifications#deploy-notifications)._',
            };

            const result = await getPreviewDataFromComments([comment], 'netlify');

            expect(result?.url).toBe('https://deploy-preview-3--preview-testing-action.netlify.app');
            expect(result?.avatar).toBe('https://example.com/avatar.png');
        });

        test('should not match other netlify.app URLs without Deploy Preview', async () => {
            const comment = {
                user: { login: 'netlify[bot]', avatar_url: 'https://example.com/avatar.png' },
                body: 'Check out https://some-other-site.netlify.app for more info',
            };

            const result = await getPreviewDataFromComments([comment], 'netlify');
            expect(result).toBeNull();
        });
    });

    describe('Cloudflare', () => {
        test('should extract URL from Cloudflare branch preview comment', async () => {
            const comment = {
                user: { login: 'cloudflare-workers-and-pages[bot]', avatar_url: 'https://example.com/avatar.png' },
                body: '## Deploying preview-action-testing with &nbsp;<a href="https://pages.dev"><img alt="Cloudflare Pages" src="https://user-images.githubusercontent.com/23264/106598434-9e719e00-654f-11eb-9e59-6167043cfa01.png" width="16"></a> &nbsp;Cloudflare Pages\n\n<table><tr><td><strong>Latest commit:</strong> </td><td>\n<code>d069c32</code>\n</td></tr>\n<tr><td><strong>Status:</strong></td><td>&nbsp;✅&nbsp; Deploy successful!</td></tr>\n<tr><td><strong>Preview URL:</strong></td><td>\n<a href=\'https://262f78c3.preview-action-testing.pages.dev\'>https://262f78c3.preview-action-testing.pages.dev</a>\n</td></tr>\n<tr><td><strong>Branch Preview URL:</strong></td><td>\n<a href=\'https://test-with-vercel.preview-action-testing.pages.dev\'>https://test-with-vercel.preview-action-testing.pages.dev</a>\n</td></tr>\n</table>\n\n[View logs](https://dash.cloudflare.com/?to=/1b78e4d791cb671ec41f83c51fc4f1fa/pages/view/preview-action-testing/262f78c3-fffc-49fa-9cca-4ab3074ae0fd)\n',
            };

            const result = await getPreviewDataFromComments([comment], 'cloudflare');

            expect(result?.url).toBe('https://test-with-vercel.preview-action-testing.pages.dev');
            expect(result?.avatar).toBe('https://example.com/avatar.png');
        });

        test('should not match other pages.dev URLs without Branch Preview URL', async () => {
            const comment = {
                user: { login: 'cloudflare-workers-and-pages[bot]', avatar_url: 'https://example.com/avatar.png' },
                body: '## Deploying preview-action-testing with &nbsp;<a href="https://pages.dev"><img alt="Cloudflare Pages" src="https://user-images.githubusercontent.com/23264/106598434-9e719e00-654f-11eb-9e59-6167043cfa01.png" width="16"></a> &nbsp;Cloudflare Pages\n\n<table><tr><td><strong>Latest commit:</strong> </td><td>\n<code>d069c32</code>\n</td></tr>\n<tr><td><strong>Status:</strong></td><td>&nbsp;✅&nbsp; Deploy successful!</td></tr>\n<tr><td><strong>Preview URL:</strong></td><td>\n<a href=\'https://262f78c3.preview-action-testing.pages.dev\'>https://262f78c3.preview-action-testing.pages.dev</a>\n</td></tr>\n\n</table>\n\n[View logs](https://dash.cloudflare.com/?to=/1b78e4d791cb671ec41f83c51fc4f1fa/pages/view/preview-action-testing/262f78c3-fffc-49fa-9cca-4ab3074ae0fd)\n',
            };

            const result = await getPreviewDataFromComments([comment], 'cloudflare');

            expect(result).toBeNull();
        });
    });

    describe('Vercel', () => {
        test('should extract URL from Vercel preview comment', async () => {
            const comment = {
                user: { login: 'vercel[bot]', avatar_url: 'https://example.com/avatar.png' },
                body: '[vc]: #1j1b6UwNlqJ/o5fLVZYEMD3zzpj+SW/1VV5nhPGlUKU=:eyJpc01vbm9yZXBvIjp0cnVlLCJ0eXBlIjoiZ2l0aHViIiwicHJvamVjdHMiOlt7Im5hbWUiOiJwcmV2aWV3LWFjdGlvbi10ZXN0aW5nIiwibGl2ZUZlZWRiYWNrIjp7InJlc29sdmVkIjowLCJ1bnJlc29sdmVkIjowLCJ0b3RhbCI6MCwibGluayI6InByZXZpZXctYWN0aW9uLXRlc3RpbmctZ2l0LXRlc3Qtdy1lMjdjYzktbWFkcy1wcm9qZWN0cy02YzkyZjQ1MS52ZXJjZWwuYXBwIn0sImluc3BlY3RvclVybCI6Imh0dHBzOi8vdmVyY2VsLmNvbS9tYWRzLXByb2plY3RzLTZjOTJmNDUxL3ByZXZpZXctYWN0aW9uLXRlc3RpbmcvMzVGdmg4cFVqbWdaWEZkd1l0NFpnb2JjTFpqbSIsInByZXZpZXdVcmwiOiJwcmV2aWV3LWFjdGlvbi10ZXN0aW5nLWdpdC10ZXN0LXctZTI3Y2M5LW1hZHMtcHJvamVjdHMtNmM5MmY0NTEudmVyY2VsLmFwcCIsIm5leHRDb21taXRTdGF0dXMiOiJERVBMT1lFRCIsInJvb3REaXJlY3RvcnkiOm51bGx9XX0=\nThe latest updates on your projects. Learn more about [Vercel for GitHub](https://vercel.link/github-learn-more).\n\n| Project | Deployment | Preview | Comments | Updated (UTC) |\n| :--- | :----- | :------ | :------- | :------ |\n| [preview-action-testing](https://vercel.com/mads-projects-6c92f451/preview-action-testing) | ![Ready](https://vercel.com/static/status/ready.svg) [Ready](https://vercel.com/mads-projects-6c92f451/preview-action-testing/35Fvh8pUjmgZXFdwYt4ZgobcLZjm) | [Preview](https://preview-action-testing-git-test-w-e27cc9-mads-projects-6c92f451.vercel.app) | [Comment](https://vercel.live/open-feedback/preview-action-testing-git-test-w-e27cc9-mads-projects-6c92f451.vercel.app?via=pr-comment-feedback-link) | Nov 14, 2025 9:24pm |\n\n',
            };

            const result = await getPreviewDataFromComments([comment], 'vercel');

            expect(result?.url).toBe(
                'https://preview-action-testing-git-test-w-e27cc9-mads-projects-6c92f451.vercel.app',
            );
            expect(result?.avatar).toBe('https://example.com/avatar.png');
        });

        test('should not match other vercel.app URLs without [Preview]', async () => {
            const comment = {
                user: { login: 'vercel[bot]', avatar_url: 'https://example.com/avatar.png' },
                body: 'Check out https://some-other-site.vercel.app',
            };

            const result = await getPreviewDataFromComments([comment], 'vercel');
            expect(result).toBeNull();
        });
    });
});
