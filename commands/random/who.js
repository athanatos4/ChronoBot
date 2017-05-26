const { Command } = require('discord.js-commando');

module.exports = class WhoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'qui',
			group: 'random',
			memberName: 'qui',
			description: 'Pose une question et reçois une réponse.',
			examples: ['qui va se marier?'],
			guildOnly: true,

			args: [
				{
					key: 'question',
					prompt: 'pose moi une question',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
		const random = msg.channel.guild.members.filter(member => member.presence.status === 'online').random().user;
		return msg.channel.sendMessage(`${msg.author} a demandé: \`qui ${args.question}\`: **${random.username}**#${random.discriminator}`);
	}
};
