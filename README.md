<div align="center">

# ⚡ JUGNU MUSIC
### Ultra-Fast, High-Performance Discord Music Bot Powered by DisTube & Discord.js v14

[![GitHub Stars](https://img.shields.io/github/stars/kabirjaipal/JUGNU-MUSIC?style=for-the-badge&color=FFE234&logo=github)](https://github.com/kabirjaipal/JUGNU-MUSIC/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/kabirjaipal/JUGNU-MUSIC?style=for-the-badge&color=00B4D8&logo=github)](https://github.com/kabirjaipal/JUGNU-MUSIC/network/members)
[![Discord Support](https://img.shields.io/badge/Discord-Support%20Server-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/FuKfAREn9f)
[![Node Version](https://img.shields.io/badge/Node.js-%E2%89%A518.17.0-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

<p align="center">
  <b>🎵 High Fidelity Audio</b> • 
  <b>⚡ Sub-Second Playback (< 1ms Cache Hits)</b> • 
  <b>🤖 45+ Slash & 49+ Message Commands</b> • 
  <b>🎛️ Interactive Controller</b> • 
  <b>🔁 24/7 Autoresume</b>
</p>

---

</div>

## 🌟 Why JUGNU MUSIC?

**JUGNU MUSIC** is an open-source, production-grade Discord music bot engineered for speed, stability, and premium audio quality. Built on **Discord.js v14** and **DisTube**, it features an optimized playback pipeline with **in-memory LRU caching**, **SingleFlight request deduplication**, and a **custom yt-dlp extractor engine** with Android client spoofing to bypass YouTube bot blocks and signature errors.

---

## ✨ Features

### 🚀 High-Speed Audio Engine
- **Instant Search & Stream Caching**: Sub-second queries and **<1ms instant cache hits** using smart in-memory LRU storage.
- **YouTube, Spotify & SoundCloud**: Native multi-source playback with playlist and mix-radio support.
- **Custom `yt-dlp` Extractor**: Android client API emulation avoids `Could not parse n transform` errors and datacenter bot challenges.
- **SingleFlight Deduplication**: Eliminates redundant network calls during high concurrent usage.

### 🎛️ Interactive Controls & UI
- **Rich Button Controls**: Skip, Pause/Resume, Stop, Loop, Shuffle, Volume, and Equalizer directly from message components.
- **Dedicated Request Channel**: Clean song request channel system with persistent player embeds.
- **24/7 Voice Channel & Auto-Resume**: Automatically rejoins and restores queues upon bot restarts or crashes.
- **Audio Filters & Effects**: BassBoost, 8D, Nightcore, Vaporwave, Tremolo, Phaser, and custom equalizer settings.
- **Custom Playlists**: Create, save, edit, and play personal user playlists stored in persistent database.
- **Lyrics & Info**: Real-time synced lyrics lookup and detailed track metadata.

---

## 🛠️ Quick Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (Version `>= 18.17.0`)
- [Python](https://www.python.org/downloads/) (Version `>= 3.8`)
- [FFmpeg](https://ffmpeg.org/) installed and available in PATH:

<details>
<summary><b>📦 How to install FFmpeg on your OS</b></summary>

- **Ubuntu / Debian**: `sudo apt update && sudo apt install -y ffmpeg`
- **Arch Linux**: `sudo pacman -S ffmpeg`
- **macOS** (Homebrew): `brew install ffmpeg`
- **Windows** (Winget / Chocolatey):
  ```powershell
  winget install Gyan.FFmpeg
  # or
  choco install ffmpeg
  ```
</details>

---

### Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kabirjaipal/JUGNU-MUSIC.git
   cd JUGNU-MUSIC
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Open `.env` and fill in your details:
   ```env
   # Discord Bot Token & Prefix
   TOKEN=YOUR_DISCORD_BOT_TOKEN
   PREFIX=!!

   # Database (Optional - Uses fast JSON storage by default if omitted)
   MONGO_URL=

   # Slash Command Deployment
   # Provide your server ID for instant command loading, or set SLASH_GLOBAL=true
   GUILD_ID=YOUR_DISCORD_SERVER_ID
   SLASH_GLOBAL=false

   # Express Keep-Alive Port
   PORT=3000
   ```

4. **Start the bot**:
   ```bash
   npm start
   ```
   *(For development with auto-reload: `npm run dev`)*

---

## 🎮 Commands Overview

<details>
<summary><b>🎵 Music Commands</b></summary>

| Command | Description |
| :--- | :--- |
| `/play <song>` | Plays a song or playlist from YouTube, Spotify, or SoundCloud |
| `/pause` & `/resume` | Pauses or resumes current playback |
| `/skip` | Skips the current track |
| `/stop` | Stops playback and clears the queue |
| `/queue` | Displays current songs in queue |
| `/nowplaying` | Shows detailed info about the currently playing song |
| `/loop <mode>` | Loops single song, entire queue, or disables loop |
| `/shuffle` | Randomizes the queue order |
| `/volume <1-150>` | Adjusts playback volume |
| `/seek <seconds>` | Jumps to a specific timestamp in the track |
| `/filter <name>` | Applies audio effects (Bassboost, Nightcore, 8D, etc.) |
| `/remove <index>` | Removes a track at a specific index from queue |
| `/jump <index>` | Skips directly to a song in the queue |
| `/lyrics [song]` | Displays lyrics for the current or requested song |

</details>

<details>
<summary><b>📑 Playlist Commands</b></summary>

| Command | Description |
| :--- | :--- |
| `/playlist create <name>` | Creates a new custom playlist |
| `/playlist savecurrent <name>` | Saves currently playing song to playlist |
| `/playlist savequeue <name>` | Saves current entire queue to playlist |
| `/playlist play <name>` | Plays a custom saved playlist |
| `/playlist list` | Lists all your saved playlists |
| `/playlist delete <name>` | Deletes a custom playlist |

</details>

<details>
<summary><b>⚙️ Settings & Utility Commands</b></summary>

| Command | Description |
| :--- | :--- |
| `/setupmusic` | Sets up a dedicated music request channel |
| `/247` | Toggles 24/7 voice channel mode |
| `/autoresume` | Toggles queue auto-resume on bot restarts |
| `/dj` | Configures the DJ role for music commands |
| `/ping` | Displays bot latency and WebSocket ping |
| `/stats` | Shows system and resource usage stats |

</details>

---

## 🏗️ Architecture & Performance Design

```
Discord Interaction / Message
        │
        ▼
   Client Router ───────────────► In-Memory LRU Cache (<1ms)
        │                               │
        ▼ (Cache Miss)                  ▼
 InnerTube API / yt-search  ──────► Audio Stream Cache
        │
        ▼
 DisTube Audio Pipeline ◄───── Custom yt-dlp Android Extractor
        │
        ▼
 FFmpeg Audio Stream ────────► Discord Voice Gateway
```

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

### ⭐ Star the repo if you like JUGNU MUSIC!

Made with ❤️ by [Kabir Jaipal](https://github.com/kabirjaipal) & Contributors

</div>
