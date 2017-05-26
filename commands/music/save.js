const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');

module.exports = class SaveQueueCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'save',
			aliases: ['save-songs', 'save-song-list'],
			group: 'music',
			memberName: 'save',
			description: 'Sauvegarde la file de chansons.',
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}

	run(msg) {
		const queue = this.queue.get(msg.guild.id);
		if (!queue) return msg.reply('aucune musique actuellement.');
		const song = queue.songs[0];

		msg.reply('✔ Regardez vos messages');
		let embed = {
			color: 3447003,
			author: {
				name: `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`,
				icon_url: msg.author.displayAvatarURL // eslint-disable-line camelcase
			},
			description: stripIndents`
				**Currently playing:**
				${song.url.match(/^https?:\/\/(api.soundcloud.com)\/(.*)$/)
					? `${song}`
					: `[${song}](${`${song.url}`})`}
				${song.url.match(/^https?:\/\/(api.soundcloud.com)\/(.*)$/)
					? 'A SoundCloud song is currently playing.'
					: ''}
			`,
			image: { url: song.thumbnail }
		};

		return msg.author.send('', { embed });
	}

	get queue() {
		if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

		return this._queue;
	}
};