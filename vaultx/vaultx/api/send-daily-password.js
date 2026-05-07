// api/send-daily-password.js
// Vercel cron job — runs daily at 8:00 AM UTC
// Set DISCORD_WEBHOOK_URL in Vercel environment variables

export const config = {
  runtime: 'edge',
};

const WORDS = ['NOVA','PRISM','ECHO','FLUX','CIPHER','GHOST','NEON','ORBIT','PIXEL','ROGUE','STATIC','VENOM','ZENITH','QUASAR','PHANTOM'];
const NUMS  = ['007','13','42','99','404','777','21','88'];

function getDailyPassword(date) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const word = WORDS[seed % WORDS.length];
  const num  = NUMS[Math.floor(seed / WORDS.length) % NUMS.length];
  return word + num;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  });
}

export default async function handler(req) {
  // Protect the endpoint — only allow Vercel cron or requests with the cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return new Response('Missing DISCORD_WEBHOOK_URL env var', { status: 500 });
  }

  const today    = new Date();
  const password = getDailyPassword(today);
  const dateStr  = formatDate(today);

  // Tomorrow's password as a sneak peek
  const tomorrow     = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowPass = getDailyPassword(tomorrow);

  const payload = {
    username: 'VaultX Bot',
    avatar_url: 'https://i.imgur.com/AfFp7pu.png',
    embeds: [
      {
        title: '🔐  VaultX — Daily Access Code',
        description: `The vault has rotated. Here is today's access code.\nShare **only** with trusted members.`,
        color: 0x7c3aed,
        fields: [
          {
            name: '📅  Date',
            value: `\`${dateStr}\``,
            inline: false,
          },
          {
            name: '🗝️  Today\'s Code',
            value: `# \`${password}\``,
            inline: false,
          },
          {
            name: '👁️  Tomorrow\'s Code (sneak peek)',
            value: `||\`${tomorrowPass}\`||`,
            inline: false,
          },
          {
            name: '🌐  Vault URL',
            value: `[Open VaultX](${process.env.SITE_URL || 'https://your-site.vercel.app'})`,
            inline: false,
          },
        ],
        footer: {
          text: 'VaultX • Code resets every day at 00:00 UTC',
        },
        timestamp: today.toISOString(),
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(`Discord error: ${text}`, { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, password, date: dateStr }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
