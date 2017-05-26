const { Command } = require('discord.js-commando');

module.exports = class CoinFlipCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'coin',
			group: 'random',
			memberName: 'coin',
			description: 'Lance une pièce',
			details: `Flip me!`,
			examples: ['coin']
		});
	}

	async run(msg) {
		const res = `${Math.random() < 0.5 ? 'face' : 'pile'}`;
		await msg.say(`${msg.author} lance une pièce: **${res}**!`);
		msg.channel.sendFile(require('path').join(__dirname, `../../assets/coin/${res}r.png`));
	}
};