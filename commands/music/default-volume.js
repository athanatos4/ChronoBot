const { Command } = require('discord.js-commando');

const { DEFAULT_VOLUME } = process.env;

module.exports = class DefaultVolumeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'default-volume',
			group: 'music',
			memberName: 'default-volume',
			description: 'Montre ou change le volume.',
			format: '[level|"default"]',
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}

	hasPermission(msg) {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
	}

	run(msg, args) {
		if (!args) {
			const defaultVolume = this.client.provider.get(msg.guild.id, 'defaultVolume', DEFAULT_VOLUME);
			return msg.reply(`Le volume par défaut est ${defaultVolume}.`);
		}

		if (args.toLowerCase() === 'default') {
			this.client.provider.remove(msg.guild.id, 'defaultVolume');
			return msg.reply(`Volume par défaut mis à (currently ${DEFAULT_VOLUME}).`);
		}

		const defaultVolume = parseInt(args);
		if (isNaN(defaultVolume) || defaultVolume <= 0 || defaultVolume > 10) {
			return msg.reply(`Nombre invalide, cela doit être entre 0 et 10.`);
		}

		this.client.provider.set(msg.guild.id, 'defaultVolume', defaultVolume);

		return msg.reply(`Volume mis à ${defaultVolume}.`);
	}
};