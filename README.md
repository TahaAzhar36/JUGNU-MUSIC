# Hi, I'm Kabir! 👋

I'm Kabir, a Discord Bot Developer, and here is my advanced Discord Music Bot.

## **Installation | How to use the Bot**

**1.** Install the latest LTS [NodeJS](https://nodejs.org/en/).

**2.** Install the latest [Python](https://www.python.org/downloads/)

**3.** Download this repo and unzip it or use `git clone`.

**4.** Fill in everything in **`settings/config.js`**.

### _Modify - config.js_

```javascript
{
  TOKEN: "BOT_TOKEN",
  PREFIX: "BOT_PREFIX",
  mongodb : "MONGO_URL"
}
```

### _Modify - .env_

Rename `.env.example` to `.env` and configure the following keys:

```env
# Discord
TOKEN=
PREFIX=

# Database (optional if using JSON storage)
MONGO_URL=

# Slash commands
# Comma-separated list of guild IDs (for faster, per-guild registration)
GUILD_ID=
# Set to true to register commands globally (may take up to 1 hour to propagate)
SLASH_GLOBAL=false

# Web server
PORT=3000

# Reduce noisy update checks from ytsr/ytdl
YTSR_NO_UPDATE=true
YTDL_NO_UPDATE=true

# Voice diagnostics (optional; set true to print a dependency report on startup)
VOICE_DEBUG_REPORT=false
```

Notes:
- If you want global slash commands, set `SLASH_GLOBAL=true`. Otherwise, keep `GUILD_ID` set (you can provide multiple IDs separated by commas) for instant per‑guild updates.
- `MONGO_URL` enables MongoDB storage via JoshDB’s Mongo provider; if omitted, JSON storage is used.

**4.** Fill everything in the config, then type in:

```sh
npm install
```

**5.** Install additional packages:

```sh
npm install @discordjs/opus zlib-sync@latest erlpack@latest
```

**6.** Start the bot with:

```sh
node index.js
```

## Music Bot Features

- Easy-to-use Music Bot
- Supports Youtube, Spotify, Soundcloud, and 700+ other websites
- Slash commands support
- Dashboard support
- Message commands support
- Stable & up-to-date with discord.js v14
- 24/7 voice channel support
- Autoresume system
- Music request channel system
- Additional filters
- DJ system
- Works on Replit and other VPS

## Music Bot Dashboard Setup

[Click Here](https://github.com/kabirsingh2004/JUGNU-Dashboard/blob/main/README.md)

## Feedback & Support

If you have any feedback or need assistance, please join our [Discord Server](https://discord.gg/FuKfAREn9f).

## License

This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/).

### Thanks For Using Music Bot! Please Give it a Star and give credit

Your support is appreciated! 🌟
