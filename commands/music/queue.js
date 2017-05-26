const { Command, util } = require('discord.js-commando');
const { oneLine, stripIndents } = require('common-tags');

const { PAGINATED_ITEMS } = process.env;
const Song = require('../../structures/Song');

module.exports = class ViewQueueCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'queue',
			aliases: ['songs', 'song-list'],
			group: 'music',
			memberName: 'queue',
			description: 'Liste les musiques dans la file.',
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'page',
					prompt: 'quelle page voulez-vous voir?\n',
					type: 'integer',
					default: 1
				}
			]
		});
	}

	run(msg, { page }) {
		const queue = this.queue.get(msg.guild.id);
		if (!queue) return msg.reply('aucune chanson dans la file');

		const paginated = util.paginate(queue.songs, page, Math.floor(PAGINATED_ITEMS));
		const totalLength = queue.songs.reduce((prev, song) => prev + song.length, 0);
		const currentSong = queue.songs[0];
		const currentTime = currentSong.dispatcher ? currentSong.dispatcher.time / 1000 : 0;

		return msg.embed({
			color: 3447003,
			author: {
				name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
				icon_url: msg.author.displayAvatarURL // eslint-disable-line camelcase
			},
			description: stripIndents`
				__**Song queue, page ${paginated.page}**__
				${paginated.items.map(song => `**-** ${!isNaN(song.id)
				? `${song.name} (${song.lengthString})`
				: `[${song.name}](${`https://www.youtube.com/watch?v=${song.id}`})`} (${song.lengthString})`).join('\n')}
				${paginated.maxPage > 1 ? `\nUse ${msg.usage()} to view a specific page.\n` : ''}
				**Now playing:** ${!isNaN(currentSong.id)
				? `${currentSong.name}`
				: `[${currentSong.name}](${`https://www.youtube.com/watch?v=${currentSong.id}`})`}
				${oneLine`
					**Progress:**
					${!currentSong.playing ? 'Paused: ' : ''}${Song.timeString(currentTime)} /
					${currentSong.lengthString}
					(${currentSong.timeLeft(currentTime)} left)
				`}
				**Total queue time:** ${Song.timeString(totalLength)}
			`
		});
	}

	get queue() {
		if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

		return this._queue;
	}
};