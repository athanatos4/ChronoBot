const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');
const RussianRoulette = require('../../structures/RussianRoulette');

module.exports = class RussianRouletteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'russian-roulette',
			aliases: ['rus-roulette', 'rr'],
			group: 'random',
			memberName: 'russian-roulette',
			description: `Play a game of russian roulette!`,
			details: `Joue à la roulette russe.`,
			guildOnly: true,
			throttling: {
				usages: 1,
				duration: 30
			}
		});
	}

	async run(msg) {
		let roulette = RussianRoulette.findGame(msg.guild.id);

		if (roulette) {
			if (roulette.hasPlayer(msg.author.id)) {
				return msg.reply('Vous avez déjà rejoint.');
			}

			if (roulette.players.length === 6) {
				return msg.reply('Seulement six personnes peuvent rejoindre');
			}

			roulette.join(msg.author);

			return msg.reply('vous avez rejoint la partie.');
		}

		roulette = new RussianRoulette(msg.guild.id);
		roulette.join(msg.author);

		const barrel = this.generateBarrel();

		return msg.say(stripIndents`
			Une nouvelle partie de roulette russe commence!

			Utilisez la commande ${msg.usage()} dans les 15 secondes pour rejoindre!
		`).then(async () => {
			setTimeout(() => msg.say('5 secondes de plus pour rejoindre'), 10000);
			setTimeout(() => { if (roulette.players.length > 1) msg.say('La partie commence !'); }, 14500);

			const players = await roulette.awaitPlayers(15000);
			if (players.length === 1) {
				return msg.say('Il semble que aucune autre personne ne veut rejoindre.');
			}

			let deadPlayer = null;
			let survivors = [];

			for (const slot in barrel) {
				let currentPlayer = players[slot % players.length];
				if (!deadPlayer) deadPlayer = currentPlayer;
			}

			survivors = players.filter(player => player !== deadPlayer);

			return msg.embed({
				description: stripIndents`
					__**Survivants**__
					${survivors.map(survivor => survivor.user.username).join('\n')}
				`
			});
		});
	}

	generateBarrel() {
		let barrel = [0, 0, 0, 0, 0, 0];
		barrel[Math.floor(Math.random() * barrel.length)] = 1;

		return barrel;
	}
};
