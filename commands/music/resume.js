const { Command } = require('discord.js-commando');

module.exports = class ResumeSongCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'resume',
			group: 'music',
			memberName: 'resume',
			description: 'Retour à la chanson.',
			details: 'Seuls les modérateurs peuvent utiliser la commande.',
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
		if (!queue) return msg.reply(`Il n'y a pas de musiques à continuer.`);
		if (!queue.songs[0].dispatcher) {
			return msg.reply('La chanson n a pas commencé.');
		}
		if (queue.songs[0].playing) return msg.reply('La chanson n est pas en pause.'); // eslint-disable-line max-len
		queue.songs[0].dispatcher.resume();
		queue.songs[0].playing = true;

		return msg.reply('chanson continuée');
	}

	get queue() {
		if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

		return this._queue;
	}
};