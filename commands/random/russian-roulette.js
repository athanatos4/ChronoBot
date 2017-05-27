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
			details: `Play a game of russian roulette.`,
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
				return msg.reply('you have already joined this game of russian roulette.');
			}

			if (roulette.players.length === 6) {
				return msg.reply('only 6 people can join at a time. You\'ll have to wait for the next round');
			}

			roulette.join(msg.author);

			return msg.reply('you have successfully joined the game.');
		}

		roulette = new RussianRoulette(msg.guild.id);
		roulette.join(msg.author);

		const barrel = this.generateBarrel();

		return msg.say(stripIndents`
			A new game of russian roulette has been initiated!

			Use the ${msg.usage()} command in the next 15 seconds to join!
		`).then(async () => {
			setTimeout(() => msg.say('5 more seconds for new people to join'), 10000);
			setTimeout(() => { if (roulette.players.length > 1) msg.say('The game begins!'); }, 14500);

			const players = await roulette.awaitPlayers(15000);
			if (players.length === 1) {
				return msg.say('Seems like no one else wanted to join. Ah well, maybe another time.');
			}

			let deadPlayer = null;
			let survivors = [];

			for (const slot in barrel) {
				let currentPlayer = players[slot % players.length];
         msg.say('Au tour de ' + currentPlayer.user.toString());
        if(barrel[slot]=== 1)
        {
          msg.say('Ah, ben t\'es mort ' + currentPlayer.user.toString());
          deadPlayer = currentPlayer;
          break;
        }
        msg.say('C\'est bon pour ' + currentPlayer.user.toString());
			}

			survivors = players.filter(player => player !== deadPlayer);

			return msg.embed({
				description: stripIndents`
					__**Survivors**__
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
