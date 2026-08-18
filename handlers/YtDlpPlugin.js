const { PlayableExtractorPlugin, Playlist, Song, DisTubeError } = require("distube");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const { metadataCache, streamUrlCache, singleFlight } = require("./Cache");

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

function fetchFastStreamUrl(url) {
  const cached = streamUrlCache.get(url);
  if (cached) {
    return Promise.resolve(cached);
  }

  return singleFlight.do(`stream:${url}`, () => {
    const binary = resolveBinaryPath();
    const rootCookies = path.join(__dirname, "..", "cookies.txt");
    const cookieFlags = fs.existsSync(rootCookies) ? ["--cookies", rootCookies] : [];

    const flags = [
      "-g",
      "--no-warnings",
      "--no-check-certificates",
      "-f",
      "ba/ba*",
      "--extractor-args",
      "youtube:player_client=android;player_skip=webpage,configs",
      ...cookieFlags,
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
        const streamUrl = stdout.trim().split("\n")[0]?.trim();
        if (code === 0 && streamUrl && streamUrl.startsWith("http")) {
          streamUrlCache.set(url, streamUrl);
          resolve(streamUrl);
        } else {
          reject(new Error(stderr || stdout || `yt-dlp exited with code ${code}`));
        }
      });

      proc.on("error", reject);
    });
  });
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
        id: info.id || info.videoId,
        name: info.title || info.fulltitle,
        url: info.webpage_url || info.original_url || info.url || `https://youtu.be/${info.id || info.videoId}`,
        isLive: Boolean(info.is_live || info.live),
        thumbnail: info.thumbnail || info.thumbnails?.[0]?.url || (info.image ? info.image : undefined),
        duration: info.is_live ? 0 : info.duration || info.seconds || 0,
        uploader: {
          name: info.uploader || info.author?.name || "YouTube",
          url: info.uploader_url || info.author?.url || "",
        },
        views: info.view_count || info.views || 0,
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
    const cachedInfo = metadataCache.get(url);
    if (cachedInfo) {
      return new CustomYtDlpSong(this, cachedInfo, options);
    }

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
    const streamUrl = await fetchFastStreamUrl(song.url).catch((err) => {
      console.error(`[YtDlpPlugin Stream Error]:`, err.message || err);
      throw new DisTubeError("YTDLP_ERROR", `${err.message || err}`);
    });

    return streamUrl;
  }

  getRelatedSongs() {
    return [];
  }
}

module.exports = {
  CustomYtDlpPlugin,
  CustomYtDlpSong,
  fetchFastStreamUrl,
};
