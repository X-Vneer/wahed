This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy with Hostinger Docker Manager

The app is built as a Docker image by GitHub Actions and pushed to [GitHub Container Registry](https://ghcr.io) (GHCR).

1. **After each push to `main`**, the workflow [`.github/workflows/docker-publish.yml`](.github/workflows/docker-publish.yml) builds and pushes `ghcr.io/x-vneer/internal-system:latest`.

2. **On your Hostinger server (Docker Manager):**
   - Add this repo (or upload `docker-compose.yml` and `.env`).
   - If the image is **private**: connect the registry (GHCR) and log in with a GitHub Personal Access Token (scopes: `read:packages`).
   - Run **Pull** (or `docker compose pull`) then **Start** (or `docker compose up -d`).
   - Set `DATABASE_URL` and `JWT_SECRET` in your environment (e.g. in Docker Manager or `.env`).

3. **Optional:** Use `workflow_dispatch` in the Actions tab to trigger a build without pushing to `main`.

**GitHub Actions env and secrets:** This workflow does not require any secrets or variables in the repo. It uses the automatic `GITHUB_TOKEN` to push to GHCR. `REGISTRY` and `IMAGE_NAME` are set in the workflow file. Do not put `DATABASE_URL` or `JWT_SECRET` in GitHub—set those only on the server (Hostinger). To add repo-wide variables or secrets later: **Settings → Secrets and variables → Actions** (Variables: `${{ vars.NAME }}`, Secrets: `${{ secrets.NAME }}`).

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
