const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  User,
  EmbedBuilder,
} = require("discord.js");
const fs = require("fs");
const Distube = require("distube").default;
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { filters, options } = require("../settings/config");
const { CustomYtDlpPlugin } = require("./YtDlpPlugin");

class JUGNU extends Client {
  constructor() {
    super({
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.User,
      ],
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
      shards: "auto",
      failIfNotExists: false,
      allowedMentions: {
        parse: ["everyone", "roles", "users"],
        users: [],
        roles: [],
        repliedUser: false,
      },
    });

    this.events = new Collection();
    this.cooldowns = new Collection();
    this.mcommands = new Collection();
    this.commands = new Collection();
    this.aliases = new Collection();
    this.shuffleData = new Collection();
    this.leaveTimeoutHandles = new Collection();
    this.mcategories = fs.readdirSync("./Commands/Message");
    this.scategories = fs.readdirSync("./Commands/Slash");
    this.temp = new Collection();
    this.config = require("../settings/config");
    this.distube = new Distube(this, {
      emitNewSongOnly: true, // Emit 'playSong' event only when a new song starts playing
      nsfw: false, // Enable nsfw mode for searching
      savePreviousSongs: true, // Save previous songs in the queue
      joinNewVoiceChannel: false, // Join the new voice channel when a song is played
      // Additional options
      customFilters: filters, // Use custom filters if needed
      // Plugins configuration
      plugins: [
        new SpotifyPlugin(),
        new SoundCloudPlugin(),
        new CustomYtDlpPlugin(),
      ],
    });

    const ytSearch = require("yt-search");
    this.resolveQuery = async (query) => {
      if (typeof query !== "string") return query;
      const trimmed = query.trim();
      if (/^(https?:\/\/)/i.test(trimmed)) return trimmed;
      const clean = trimmed.replace(/^ytsearch[0-9]*:/i, "").trim();
      try {
        const res = await ytSearch(clean);
        if (res && res.videos && res.videos.length > 0) {
          return res.videos[0].url;
        }
      } catch (e) {
        console.error("[yt-search] Query resolution failed:", e);
      }
      return trimmed;
    };

    const originalPlay = this.distube.play.bind(this.distube);
    this.distube.play = async (voiceChannel, song, options = {}) => {
      let resolvedSong = song;
      if (typeof song === "string") {
        resolvedSong = await this.resolveQuery(song);
      }
      return originalPlay(voiceChannel, resolvedSong, options);
    };

    this.distube.search = async (query, options = {}) => {
      const clean = (typeof query === "string" ? query : "")
        .trim()
        .replace(/^ytsearch[0-9]*:/i, "")
        .trim();
      try {
        const res = await ytSearch(clean);
        if (res && res.videos && res.videos.length > 0) {
          return res.videos.slice(0, options.limit || 10).map((v) => ({
            name: v.title,
            url: v.url,
            formattedDuration: v.timestamp,
            thumbnail: v.thumbnail,
            uploader: { name: v.author?.name },
            views: v.views,
          }));
        }
      } catch (e) {
        console.error("[yt-search] Search failed:", e);
      }
      return [];
    };
  }

  start(token) {
    [
      "handler",
      "DistubeEvents",
      "RequestChannel",
      "DistubeHandler",
      "utils",
    ].forEach((handler) => {
      require(`./${handler}`)(this);
    });
    this.login(token);
  }
  /**
   *
   * @param {User} user
   * @returns
   */
  getFooter(user) {
    const obj = {
      text: `Requested By ${user.username}`,
      iconURL: user.displayAvatarURL(),
    };

    return options.embedFooter ? obj : null;
  }

  embed(interaction, data) {
    let user = interaction.user ? interaction.user : interaction.author;
    if (interaction.deferred) {
      interaction
        .followUp({
          embeds: [
            new EmbedBuilder()
              .setColor(this.config.embed.color)
              .setDescription(`${data.substring(0, 3000)}`)
              .setFooter(this.getFooter(user)),
          ],
        })
        .catch((e) => {});
    } else {
      interaction
        .reply({
          embeds: [
            new EmbedBuilder()
              .setColor(this.config.embed.color)
              .setDescription(`${data.substring(0, 3000)}`)
              .setFooter(this.getFooter(user)),
          ],
        })
        .catch((e) => {});
    }
  }
}

module.exports = JUGNU;
