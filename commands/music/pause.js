const { Command } = require('discord.js-commando');

module.exports = class PauseSongCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'pause',
			aliases: ['shh', 'shhh', 'shhhh', 'shhhhh'],
			group: 'music',
			memberName: 'pause',
			description: 'Met en pause la chanson active.',
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
		if (!queue) return msg.reply(`il n'y a pas de musiques à mettre en pause.`);
		if (!queue.songs[0].dispatcher) return msg.reply('Je ne peux pas mettre en pause une chanson qui  n a pas commencé.');
		if (!queue.songs[0].playing) return msg.reply('mettre en pause une chanson déjà en pause montre ton niveau intellectuel.');
		queue.songs[0].dispatcher.pause();
		queue.songs[0].playing = false;

		return msg.reply(`musique en pause. Utilisez \`${this.client.commandPrefix}resume\` pour continuer à écouter.`);
	}

	get queue() {
		if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

		return this._queue;
	}
};