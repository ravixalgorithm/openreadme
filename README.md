# Open Readme

Modern, auto-updating GitHub profile README generator by Open Dev Society.

- Generate a beautiful Open Readme image for your profile
- Auto-update the image via GitHub Actions
- Works with Next.js App Router, Firebase Storage, and serverless Chromium

## Quick start

Prerequisites:
- Node.js 18+
- A GitHub personal access token with repo read permissions (for stats)
- Firebase project (Storage enabled)

Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000 and fill your details to generate your Open Readme.

## Environment variables
Create a .env.local with:

```
GITHUB_TOKEN=ghp_xxx
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
CHROME_EXECUTABLE_PATH=  # optional locally
NEXT_PUBLIC_SITE_URL=    # optional for production metadata
```

## Image generation API

Endpoint: `/api/openreadme`

Query params:
- n: name
- g: GitHub username
- x: X/Twitter handle
- l: LinkedIn username
- i: profile image URL
- p: portfolio/site URL
- z: cache-buster/random id

Response: `{ url: "https://.../openreadme/<id>.png" }`

## Auto-update in your repo

From the generator modal after creating your image:
- Click "Download Files" to get:
  - `update-openreadme.yml` (GitHub Actions workflow)
  - `get-openreadme.ts` (Node script to fetch the latest image)
- Commit both files to your repo (e.g., under `.github/workflows/update-openreadme.yml` and `scripts/get-openreadme.ts`).
- Enable the workflow (schedule/dispatch) to keep your README image up to date.

Embed in your README.md:

```
[![OpenReadme](<generated-image-url>)](https://openreadme.dev)
```

Replace the link with your deployed site if different.

## Development notes
- This project uses Next.js App Router and Next/Image. Remote images must be whitelisted in `next.config.ts`.
- Server-side image rendering uses puppeteer-core with @sparticuz/chromium-min.
- Generated images are uploaded to Firebase Storage under `openreadme/`.

## License

MIT
