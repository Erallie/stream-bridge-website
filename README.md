# StreamBridge website

The public StreamBridge site and account dashboard. It is a static SvelteKit/TypeScript site suitable for GitHub Pages. Passwords, OAuth tokens, and relay configuration are never stored in GitHub Pages; the dashboard calls the secure StreamBridge API running on the bot host through Cloudflare Tunnel.

## Local development

1. Copy `.env.example` to `.env`.
2. Set `PUBLIC_STREAMBRIDGE_API_URL` to the public URL of the StreamBridge API, or `http://localhost:8765` during local development.
3. Run `npm install`.
4. Run `npm run dev`.

Run `npm run check`, `npm run lint`, and `npm run build` before publishing.

## GitHub Pages

The production build is written to `build/`. The included workflow checks and publishes it after pushes to `main`. In the repository's **Settings → Pages**, select **GitHub Actions** as the source. Add an Actions variable named `STREAMBRIDGE_API_URL` containing the public dashboard API URL.

If this is served at a repository subpath such as `/stream-bridge-website`, add an Actions variable named `BASE_PATH` with that value. Leave it empty when a custom domain serves the site at `/`.

## StreamBridge host setup

Add these dashboard variables to the Pi-hosted bot's `.env`:

```ini
DASHBOARD_SITE_URL=https://YOUR_SITE
DASHBOARD_ALLOWED_ORIGINS=https://YOUR_SITE
DASHBOARD_API_PUBLIC_URL=https://YOUR_STREAMBRIDGE_API_HOST
```

Route that API hostname through the existing Cloudflare Tunnel to StreamBridge's local listener. No inbound router port is required. Register these exact OAuth callbacks:

- Discord: `https://YOUR_STREAMBRIDGE_API_HOST/dashboard/auth/discord/callback`
- Google: `https://YOUR_STREAMBRIDGE_API_HOST/dashboard/auth/google/callback`
- Twitch: `https://YOUR_STREAMBRIDGE_API_HOST/dashboard/auth/twitch/callback`
- Kick: `https://YOUR_STREAMBRIDGE_API_HOST/dashboard/auth/kick/callback`

The original platform callback routes used by Discord slash-command configuration remain available.

## Legal documents

The rendered pages use the Markdown files in `src/lib/legal/`. Copies are also published under `static/legal/` for direct access. Update both copies when the final policy or terms change.
