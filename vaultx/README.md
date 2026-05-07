# 🔐 VaultX — Encrypted Communications

A secret cipher site for you and your friends. Password rotates daily and gets sent to your Discord automatically.

---

## 📁 Project Structure

```
vaultx/
├── public/
│   └── index.html          # The site
├── api/
│   └── send-daily-password.js  # Cron job → Discord
├── vercel.json             # Cron schedule (8AM UTC daily)
├── .env.example            # Env var template
└── .gitignore
```

---

## 🚀 Deployment Guide

### Step 1 — Push to GitHub

```bash
cd vaultx
git init
git add .
git commit -m "initial vaultx deploy"
```

Create a new repo on GitHub (make it **private** if you want extra security), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/vaultx.git
git branch -M main
git push -u origin main
```

---

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Leave all settings as default — click **Deploy**

---

### Step 3 — Set Environment Variables

In your Vercel project → **Settings → Environment Variables**, add these:

| Name | Value |
|------|-------|
| `DISCORD_WEBHOOK_URL` | Your Discord webhook URL |
| `CRON_SECRET` | Any random string (e.g. from [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)) |
| `SITE_URL` | Your Vercel URL e.g. `https://vaultx.vercel.app` |

Then **redeploy** so the env vars take effect (Deployments → Redeploy).

---

### Step 4 — Test the Discord notification

After deploying, test by calling the endpoint manually with your CRON_SECRET:

```bash
curl -X GET https://YOUR-SITE.vercel.app/api/send-daily-password \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

You should see the password card appear in Discord. ✅

---

## ⏰ Cron Schedule

The password posts to Discord every day at **8:00 AM UTC**.  
To change the time, edit `vercel.json`:

```json
"schedule": "0 8 * * *"
```

Use [crontab.guru](https://crontab.guru) to build a custom schedule.

---

## 🔑 How the Daily Password Works

The password is generated from the current date using a deterministic formula — so the site and the cron job always agree on today's code with no database needed.

---

## 🔒 Security Notes

- Never commit `.env.local` — it's in `.gitignore`
- The cron endpoint is protected by `CRON_SECRET` so nobody can spam it
- The Discord webhook URL lives only in Vercel's encrypted env vars
