const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');

const responses = [
	'Nope',
	'Je ne sais pas',
	'Bien sur que non',
	'Peut-être',
	'Sans aucun doute',
	'Indubitablement',
	'Probablement',
	'Pas sur',
    'Ce sera un oui pour moi!',
	'OUI, OUI, OUI!',
	'Dans tes rêves!',
	'Tu connais la réponse...',
	'Bien sur que oui.',
    'Tu ne serais pas un petit peu con?',
	'Si tu penses ça...'
];

module.exports = class EightBallCommand extends Command {
	constructor(client) {
		super(client, {
			name: '8ball',
			group: 'random',
			memberName: '8ball',
			description: 'Pose une question et reçois la réponse.',
			details: `Ask a question and I will respond with a random anwer!`,
			examples: ['8ball Do you love me?'],

			args: [
				{
					key: 'question',
					prompt: 'ask me a question! Don\'t be shy...',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
		return msg.say(stripIndents`
			🎱 ${msg.author} a demandé \`${args.question}\`
			Réponse: ${responses[Math.floor(Math.random() * responses.length)]}
		`);
	}
};