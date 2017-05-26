const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');

const { MAX_LENGTH } = process.env;

module.exports = class MaxLengthCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'max-length',
			aliases: ['max-duration', 'max-song-length', 'max-song-duration'],
			group: 'music',
			memberName: 'max-length',
			description: 'Montre ou change la durée maximum pour une chanson.',
			format: '[minutes|"default"]',
			details: oneLine`
				Ceci est la durée maximum d'une chanson.
				La durée par défaut est ${MAX_LENGTH}.
				Seuls les administrateurs peuvent changer cette configuration.
			`,
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
			const maxLength = this.client.provider.get(msg.guild.id, 'maxLength', MAX_LENGTH);
			return msg.reply(`La durée maximum d'une chanson est ${maxLength} minutes.`);
		}

		if (args.toLowerCase() === 'default') {
			this.client.provider.remove(msg.guild.id, 'maxLength');
			return msg.reply(`La durée maximum est mise à (currently ${MAX_LENGTH} minutes).`);
		}

		const maxLength = parseInt(args);
		if (isNaN(maxLength) || maxLength <= 0) {
			return msg.reply(`nombre invalide.`);
		}

		this.client.provider.set(msg.guild.id, 'maxLength', maxLength);

		return msg.reply(`Durée maximum mise à ${maxLength} minutes.`);
	}
};