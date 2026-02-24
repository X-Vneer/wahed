# Cron: Delete unused UploadThing files

The app exposes an API that deletes from UploadThing any files that are **not** referenced in your database (SystemFile, ProjectAttachment, TaskAttachment). You can call it from a cron job so orphaned files are cleaned periodically.

## API

- **URL:** `POST https://your-domain.com/api/cron/cleanup-uploadthing`
- **Auth:** Send one of:
  - Header: `Authorization: Bearer <CRON_SECRET>`
  - Header: `x-cron-secret: <CRON_SECRET>`

Set `CRON_SECRET` in your environment (e.g. in `.env` or Docker) to a long random string and use the same value when calling the API.

## Hostinger VPS with Docker

Your app runs in Docker. The cron job can run **on the host** (outside Docker) and call the app over HTTP.

### 1. Set CRON_SECRET

In the same place you set `DATABASE_URL`, `JWT_SECRET`, etc. (e.g. Hostinger env or a `.env` file used by `docker-compose`), add:

```bash
CRON_SECRET=your-long-random-secret-here
```

Generate a secret, for example:

```bash
openssl rand -base64 32
```

Restart the app container so it picks up `CRON_SECRET`.

### 2. Add a host cron job

On the VPS (SSH into the server), edit crontab:

```bash
crontab -e
```

Add a line to run once per day at 3:00 AM (adjust time/timezone as needed):

```cron
0 3 * * * curl -s -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/cleanup-uploadthing
```

Replace:

- `YOUR_CRON_SECRET` with the same value as `CRON_SECRET` in the app.
- `https://your-domain.com` with your real domain (e.g. `https://wahdomrania.com`).

To use the `x-cron-secret` header instead:

```cron
0 3 * * * curl -s -X POST -H "x-cron-secret: YOUR_CRON_SECRET" https://your-domain.com/api/cron/cleanup-uploadthing
```

Save and exit. The job will run at the next scheduled time.

### 3. Optional: cron inside Docker

If you prefer to run cron inside Docker, you can add a small sidecar that only runs `curl` on a schedule.

Example `docker-compose` snippet (run this **in addition** to your app service):

```yaml
  cron-cleanup:
    image: curlimages/curl:latest
    container_name: internal-system-cron-cleanup
    restart: unless-stopped
    environment:
      - CRON_SECRET=${CRON_SECRET}
      - APP_URL=https://your-domain.com
    entrypoint: ["/bin/sh", "-c"]
    command:
      - |
        while true; do
          curl -s -X POST -H "Authorization: Bearer $$CRON_SECRET" "$$APP_URL/api/cron/cleanup-uploadthing"
          sleep 86400
        done
    networks:
      - internal-system-network
```

This runs the cleanup every 24 hours (86400 seconds). For a real cron schedule you’d typically use an image that includes cron (e.g. Alpine + cron) and a crontab file; the loop above is a simple alternative.

## Response

- **200:** `{ "success": true, "deleted": 5, "message": "..." }` or `{ "deleted": 0, "message": "No unused files to delete" }`
- **401:** Missing or invalid secret
- **500:** Server error (e.g. DB or UploadThing API failure)

## Safety

- Only files **not** referenced in `SystemFile`, `ProjectAttachment`, or `TaskAttachment` are deleted.
- File keys are derived from your stored file URLs (e.g. `https://….ufs.sh/f/<key>`). If a URL in the DB is wrong or from another app, that file will not be considered “in use” and could be deleted. Ensure your DB only contains valid UploadThing UFS URLs for this app.
