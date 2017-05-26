const { Command } = require('discord.js-commando');

module.exports = class ChangeVolumeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'volume',
			aliases: ['set-volume', 'set-vol', 'vol'],
			group: 'music',
			memberName: 'volume',
			description: 'Modifie le volume.',
			format: '[level]',
			details: 'Le volume va de 1 à 10. Vous devez dire "up" ou "down" pour modifier le volume de 2.',
			examples: ['volume', 'volume 7', 'volume up', 'volume down'],
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}

	run(msg, args) {
		const queue = this.queue.get(msg.guild.id);
		if (!queue) return msg.reply(`aucune musique en cours`);
		if (!args) return msg.reply(`le volume est de ${queue.volume}.`);
		if (!queue.voiceChannel.members.has(msg.author.id)) {
			return msg.reply(`vous n êtes pas dans un channel vocal.`);
		}

		let volume = parseInt(args);
		if (isNaN(volume)) {
			volume = args.toLowerCase();
			if (volume === 'up' || volume === '+') volume = queue.volume + 2;
			else if (volume === 'down' || volume === '-') volume = queue.volume - 2;
			else return msg.reply(`volume invalide.`);
			if (volume === 11) volume = 10;
		}

		volume = Math.min(Math.max(volume, 0), volume === 11 ? 11 : 10);
		queue.volume = volume;
		if (queue.songs[0].dispatcher) queue.songs[0].dispatcher.setVolumeLogarithmic(queue.volume / 5);

		return msg.reply(`${volume === 11 ? 'pas de 11!' : `volume mis à ${volume}.`}`);
	}

	get queue() {
		if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

		return this._queue;
	}
};