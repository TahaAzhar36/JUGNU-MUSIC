const { PlayableExtractorPlugin, Playlist, Song, DisTubeError } = require("distube");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

function resolveBinaryPath() {
  const localBinary = path.join(
    __dirname,
    "..",
    "node_modules",
    "@distube",
    "yt-dlp",
    "bin",
    process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp"
  );
  if (fs.existsSync(localBinary)) {
    return localBinary;
  }
  return "yt-dlp";
}

function runYtDlpJson(url, extraFlags = []) {
  const binary = resolveBinaryPath();
  const flags = [
    "-j",
    "--no-warnings",
    "--prefer-free-formats",
    "--skip-download",
    "--simulate",
    "--extractor-args",
    "youtube:player_client=android",
    ...extraFlags,
    url,
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn(binary, flags);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    proc.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    proc.on("close", (code) => {
      if (code === 0) {
        try {
          const start = stdout.indexOf("{");
          const end = stdout.lastIndexOf("}");
          if (start === -1 || end === -1) {
            return reject(new Error("No JSON found in yt-dlp output"));
          }
          const jsonStr = stdout.slice(start, end + 1);
          resolve(JSON.parse(jsonStr));
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(stderr || stdout || `yt-dlp exited with code ${code}`));
      }
    });

    proc.on("error", reject);
  });
}

class CustomYtDlpSong extends Song {
  constructor(plugin, info, options = {}) {
    super(
      {
        plugin,
        source: info.extractor || "youtube",
        playFromSource: true,
        id: info.id,
        name: info.title || info.fulltitle,
        url: info.webpage_url || info.original_url || `https://youtu.be/${info.id}`,
        isLive: Boolean(info.is_live),
        thumbnail: info.thumbnail || info.thumbnails?.[0]?.url,
        duration: info.is_live ? 0 : info.duration || 0,
        uploader: {
          name: info.uploader,
          url: info.uploader_url,
        },
        views: info.view_count || 0,
        likes: info.like_count || 0,
        dislikes: info.dislike_count || 0,
        reposts: info.repost_count || 0,
        ageRestricted: Boolean(info.age_limit && info.age_limit >= 18),
      },
      options
    );
  }
}

class CustomYtDlpPlugin extends PlayableExtractorPlugin {
  constructor(options = {}) {
    super();
    this.options = options;
  }

  validate() {
    return true;
  }

  _getCookieFlags() {
    const rootCookies = path.join(__dirname, "..", "cookies.txt");
    if (fs.existsSync(rootCookies)) {
      return ["--cookies", rootCookies];
    }
    return [];
  }

  async resolve(url, options = {}) {
    const extraFlags = [...this._getCookieFlags()];

    const info = await runYtDlpJson(url, extraFlags).catch((err) => {
      console.error(`[YtDlpPlugin Resolve Error]:`, err.message || err);
      throw new DisTubeError("YTDLP_ERROR", `${err.message || err}`);
    });

    if (Array.isArray(info.entries)) {
      if (info.entries.length === 0) {
        throw new DisTubeError("YTDLP_ERROR", "The playlist is empty");
      }
      return new Playlist(
        {
          source: info.extractor || "youtube",
          songs: info.entries.map((i) => new CustomYtDlpSong(this, i, options)),
          id: info.id?.toString() || "",
          name: info.title,
          url: info.webpage_url,
          thumbnail: info.thumbnails?.[0]?.url,
        },
        options
      );
    }

    return new CustomYtDlpSong(this, info, options);
  }

  async getStreamURL(song) {
    if (!song.url) {
      throw new DisTubeError(
        "YTDLP_PLUGIN_INVALID_SONG",
        "Cannot get stream url from invalid song."
      );
    }
    const extraFlags = ["-f", "ba/ba*", ...this._getCookieFlags()];

    const info = await runYtDlpJson(song.url, extraFlags).catch((err) => {
      console.error(`[YtDlpPlugin Stream Error]:`, err.message || err);
      throw new DisTubeError("YTDLP_ERROR", `${err.message || err}`);
    });

    if (Array.isArray(info.entries)) {
      throw new DisTubeError(
        "YTDLP_ERROR",
        "Cannot get stream URL of an entire playlist"
      );
    }

    return info.url;
  }

  getRelatedSongs() {
    return [];
  }
}

module.exports = { CustomYtDlpPlugin, CustomYtDlpSong };
