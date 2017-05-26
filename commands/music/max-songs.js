const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');

const { MAX_SONGS } = process.env;

module.exports = class MaxSongsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'max-songs',
			group: 'music',
			memberName: 'max-songs',
			description: 'Montre ou change le nombre maximum de chansons par personne.',
			format: '[amount|"default"]',
			details: oneLine`
				Ceci est le nombre maximum de chanson qu'une personne peut mettre dans la file.
				Ce nombre est par défaut de ${MAX_SONGS}.
				Seuls les administrateurs peuvent changer ceci.
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
			const maxSongs = this.client.provider.get(msg.guild.id, 'maxSongs', MAX_SONGS);
			return msg.reply(`le nombre maximum de chansons qu'une personne peut mettre dans la file est de ${maxSongs}.`);
		}

		if (args.toLowerCase() === 'default') {
			this.client.provider.remove(msg.guild.id, 'maxSongs');
			return msg.reply(`nombre maximum mis à (currently ${MAX_SONGS}).`);
		}

		const maxSongs = parseInt(args);
		if (isNaN(maxSongs) || maxSongs <= 0) {
			return msg.reply(`nombre invalide.`);
		}

		this.client.provider.set(msg.guild.id, 'maxSongs', maxSongs);

		return msg.reply(`nombre maximum mis à ${maxSongs}.`);
	}
};