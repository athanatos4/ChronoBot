const { Command } = require('discord.js-commando');

module.exports = class StopMusicCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'stop',
			aliases: ['kill', 'stfu'],
			group: 'music',
			memberName: 'stop',
			description: 'Arrête la musique.',
			details: 'Seuls les modérateurs peuvent utiliser ceci.',
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}

	hasPermission(msg) {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES');
	}

	run(msg) {
		const queue = this.queue.get(msg.guild.id);
		if (!queue) return msg.reply('aucune musique en cours.');
		const song = queue.songs[0];
		queue.songs = [];
		if (song.dispatcher) song.dispatcher.end();

		return msg.reply('c est fini');
	}

	get queue() {
		if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

		return this._queue;
	}
};