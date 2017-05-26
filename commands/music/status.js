const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');

const Song = require('../../structures/Song');

module.exports = class MusicStatusCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'status',
			aliases: ['song', 'playing', 'current-song', 'now-playing'],
			group: 'music',
			memberName: 'status',
			description: 'Montre le status actuel de la musique.',
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}

	run(msg) {
		const queue = this.queue.get(msg.guild.id);
		if (!queue) return msg.say('aucune musique en cours.');
		const song = queue.songs[0];
		const currentTime = song.dispatcher ? song.dispatcher.time / 1000 : 0;

		const embed = {
			color: 3447003,
			author: {
				name: `${song.username}`,
				icon_url: song.avatar // eslint-disable-line camelcase
			},
			description: stripIndents`
				${song.url.match(/^https?:\/\/(api.soundcloud.com)\/(.*)$/) ? `${song}` : `[${song}](${`${song.url}`})`}
				Nous sommes à ${Song.timeString(currentTime)} de musique, il reste ${song.timeLeft(currentTime)}.
				${!song.playing ? 'La musique est en pause.' : ''}
			`,
			image: { url: song.thumbnail }
		};

		return msg.embed(embed);
	}

	get queue() {
		if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

		return this._queue;
	}
};