const { Command } = require('discord.js-commando');
const { escapeMarkdown } = require('discord.js');
const { oneLine, stripIndents } = require('common-tags');
const request = require('request-promise');
const winston = require('winston');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');

const { DEFAULT_VOLUME, GOOGLE_API, MAX_LENGTH, MAX_SONGS, PASSES, SOUNDCLOUD_API } = process.env;
const Song = require('../../structures/Song');
const { version } = require('../../package');

module.exports = class PlaySongCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'play',
			group: 'music',
			memberName: 'play',
			description: 'Ajoute une musique à la file.',
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'url',
					prompt: 'quelle musique voulez-vous écouter?\n',
					type: 'string'
				}
			]
		});

		this.queue = new Map();
		this.youtube = new YouTube(GOOGLE_API);
	}

	async run(msg, args) {
		const url = args.url.replace(/<(.+)>/g, '$1');
		const queue = this.queue.get(msg.guild.id);

		let voiceChannel;
		if (!queue) {
			voiceChannel = msg.member.voiceChannel;
			if (!voiceChannel) {
				return msg.reply('vous n êtes pas dans un channel vocal.');
			}

			const permissions = voiceChannel.permissionsFor(msg.client.user);
			if (!permissions.hasPermission('CONNECT')) {
				return msg.reply('Je n ai pas la permission de rejoindre votre channel.');
			}
			if (!permissions.hasPermission('SPEAK')) {
				return msg.reply('Je n ai pas la permission de parler dans votre channel.');
			}
		} else if (!queue.voiceChannel.members.has(msg.author.id)) {
			return msg.reply('vous n êtes pas dans le channel vocal.');
		}

		const statusMsg = await msg.reply('obtention de la vidéo');
		if (url.match(/^https?:\/\/(soundcloud.com|snd.sc)\/(.*)$/)) {
			try {
				const video = await request({
					uri: `http://api.soundcloud.com/resolve.json?url=${url}&client_id=${SOUNDCLOUD_API}`,
					headers: { 'User-Agent': `Commando v${version} (https://github.com/WeebDev/Commando/)` },
					json: true
				});

				return this.handleVideo(video, queue, voiceChannel, msg, statusMsg);
			} catch (error) {
				winston.error(`${error.statusCode}: ${error.statusMessage}`);

				return statusMsg.edit(`${msg.author}, ❌ Cette musique ne peut pas être utilisée.`);
			}
		} else if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await this.youtube.getPlaylist(url);

			return this.handlePlaylist(playlist, queue, voiceChannel, msg, statusMsg);
		} else {
			try {
				const video = await this.youtube.getVideo(url);

				return this.handleVideo(video, queue, voiceChannel, msg, statusMsg);
			} catch (error) {
				try {
					const videos = await this.youtube.searchVideos(url, 1)
						.catch(() => statusMsg.edit(`${msg.author}, il n'y a pas de résultats.`));
					const video2 = await this.youtube.getVideoByID(videos[0].id);

					return this.handleVideo(video2, queue, voiceChannel, msg, statusMsg);
				} catch (err) {
					winston.error(err);

					return statusMsg.edit(`${msg.author}, les résultats ne peuvent pas être obtenus.`);
				}
			}
		}
	}

	async handleVideo(video, queue, voiceChannel, msg, statusMsg) {
		if (video.durationSeconds === 0) {
			statusMsg.edit(`${msg.author}, vous ne pouvez pas utiliser de streams.`);

			return null;
		}

		if (!queue) {
			queue = {
				textChannel: msg.channel,
				voiceChannel: voiceChannel,
				connection: null,
				songs: [],
				volume: this.client.provider.get(msg.guild.id, 'defaultVolume', DEFAULT_VOLUME)
			};
			this.queue.set(msg.guild.id, queue);

			const result = await this.addSong(msg, video);
			const resultMessage = {
				color: 3447003,
				author: {
					name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
					icon_url: msg.author.displayAvatarURL // eslint-disable-line camelcase
				},
				description: result
			};

			if (!result.startsWith('👍')) {
				this.queue.delete(msg.guild.id);
				statusMsg.edit('', { embed: resultMessage });

				return null;
			}

			statusMsg.edit(`${msg.author}, connexion au channel`);
			try {
				const connection = await queue.voiceChannel.join();
				queue.connection = connection;
				this.play(msg.guild, queue.songs[0]);
				statusMsg.delete();

				return null;
			} catch (error) {
				winston.error('Error occurred when joining voice channel.', error);
				this.queue.delete(msg.guild.id);
				statusMsg.edit(`${msg.author}, impossible de rejoindre votre channel.`);

				return null;
			}
		} else {
			const result = await this.addSong(msg, video);
			const resultMessage = {
				color: 3447003,
				author: {
					name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
					icon_url: msg.author.displayAvatarURL // eslint-disable-line camelcase
				},
				description: result
			};
			statusMsg.edit('', { embed: resultMessage });

			return null;
		}
	}

	async handlePlaylist(playlist, queue, voiceChannel, msg, statusMsg) {
		const videos = await playlist.getVideos();
		for (const video of Object.values(videos)) {
			const video2 = await this.youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
			if (video2.durationSeconds === 0) {
				statusMsg.edit(`${msg.author}, vous ne pouvez pas utiliser de streams.`);

				return null;
			}

			if (!queue) {
				queue = {
					textChannel: msg.channel,
					voiceChannel: voiceChannel,
					connection: null,
					songs: [],
					volume: this.client.provider.get(msg.guild.id, 'defaultVolume', DEFAULT_VOLUME)
				};
				this.queue.set(msg.guild.id, queue);

				const result = await this.addSong(msg, video2); // eslint-disable-line no-await-in-loop
				if (!result.startsWith('👍')) this.queue.delete(msg.guild.id);

				statusMsg.edit(`${msg.author}, connexion au channel`);
				try {
					const connection = await queue.voiceChannel.join(); // eslint-disable-line no-await-in-loop
					queue.connection = connection;
					this.play(msg.guild, queue.songs[0]);
					statusMsg.delete();
				} catch (error) {
					winston.error('Error occurred when joining voice channel.', error);
					this.queue.delete(msg.guild.id);
					statusMsg.edit(`${msg.author}, impossible de rejoindre votre channel.`);
				}
			} else {
				await this.addSong(msg, video2); // eslint-disable-line no-await-in-loop
				statusMsg.delete();
			}
		}

		queue.textChannel.send({
			embed: {
				color: 3447003,
				author: {
					name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
					icon_url: msg.author.displayAvatarURL // eslint-disable-line camelcase
				},
				description: stripIndents`
					Playlist: [${playlist.title}](https://www.youtube.com/playlist?list=${playlist.id}) ajoutée à la file!
					Regardez ce qui a été ajouté avec: \`?queue\` !
				`
			}
		});

		return null;
	}

	addSong(msg, video) {
		const queue = this.queue.get(msg.guild.id);

		if (!this.client.isOwner(msg.author)) {
			const songMaxLength = this.client.provider.get(msg.guild.id, 'maxLength', MAX_LENGTH);
			if (songMaxLength > 0 && video.durationSeconds > songMaxLength * 60) {
				return oneLine`
					👎 ${escapeMarkdown(video.title)}
					(${Song.timeString(video.durationSeconds)})
					est trop long. Pas de musique plus longues que ${songMaxLength} minutes!
				`;
			}
			if (queue.songs.some(song => song.id === video.id)) {
				return `👎 ${escapeMarkdown(video.title)} est déjà dans la file.`;
			}
			const songMaxSongs = this.client.provider.get(msg.guild.id, 'maxSongs', MAX_SONGS);
			if (songMaxSongs > 0
				&& queue.songs.reduce((prev, song) => prev + song.member.id === msg.author.id, 0)
				>= songMaxSongs) {
				return `👎 vous avez déjà ${songMaxSongs} dans la file.`;
			}
		}

		winston.info('Adding song to queue.', { song: video.id, guild: msg.guild.id });
		const song = new Song(video, msg.member);
		queue.songs.push(song);

		return oneLine`
			👍 ${song.url.match(/^https?:\/\/(api.soundcloud.com)\/(.*)$/)
				? `${song}`
				: `[${song}](${`${song.url}`})`}
		`;
	}

	play(guild, song) {
		const queue = this.queue.get(guild.id);

		const vote = this.votes.get(guild.id);
		if (vote) {
			clearTimeout(vote);
			this.votes.delete(guild.id);
		}

		if (!song) {
			queue.textChannel.send('Plus de musiques dans la file.');
			queue.voiceChannel.leave();
			this.queue.delete(guild.id);
			return;
		}

		const playing = queue.textChannel.send({
			embed: {
				color: 3447003,
				author: {
					name: song.username,
					icon_url: song.avatar // eslint-disable-line camelcase
				},
				description: `
					${song.url.match(/^https?:\/\/(api.soundcloud.com)\/(.*)$/)
					? `${song}`
					: `[${song}](${`${song.url}`})`}
				`,
				image: { url: song.thumbnail }
			}
		});
		let stream;
		let streamErrored = false;
		if (song.url.match(/^https?:\/\/(api.soundcloud.com)\/(.*)$/)) {
			stream = request({
				uri: song.url,
				headers: { 'User-Agent': `Commando v${version} (https://github.com/WeebDev/Commando/)` },
				followAllRedirects: true
			});
		} else {
			stream = ytdl(song.url, { audioonly: true })
				.on('error', err => {
					streamErrored = true;
					winston.error('Error occurred when streaming video:', err);
					playing.then(msg => msg.edit(`❌ Impossible de jouer ${song}.`));
					queue.songs.shift();
					this.play(guild, queue.songs[0]);
				});
		}
		const dispatcher = queue.connection.playStream(stream, { passes: PASSES })
			.on('end', () => {
				if (streamErrored) return;
				queue.songs.shift();
				this.play(guild, queue.songs[0]);
			})
			.on('error', err => {
				winston.error('Error occurred in stream dispatcher:', err);
				queue.textChannel.send(`Une erreur est survenue: \`${err}\``);
			});
		queue.connection.player.opusEncoder.setPLP(0.01);
		dispatcher.setVolumeLogarithmic(queue.volume / 5);
		song.dispatcher = dispatcher;
		song.playing = true;
	}

	get votes() {
		if (!this._votes) this._votes = this.client.registry.resolveCommand('music:skip').votes;

		return this._votes;
	}
};