const { Command } = require('discord.js-commando');
const responses = ['Papier', 'Pierre', 'ciseaux'];

module.exports = class RockPaperScissorsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'pierre-papier-ciseaux',
            aliases: ['ppc'],
            group: 'random',
            memberName: 'pierre-papier-ciseaux',
            description: 'Pierre-papier-ciseaux.',
            args: [
                {
                    key: 'choice',
                    prompt: '`Pierre`, `Papier`, ou `Ciseaux`?',
                    type: 'string',
                    validate: choice => {
                        if (['pierre', 'papier', 'ciseaux'].includes(choice.toLowerCase())) return true;
                        return 'Faites `pierre`, `papier`, ou `ciseaux`.';
                    },
                    parse: choice => choice.toLowerCase()
                }
            ]
        });
    }

    run(msg, args) {
        const { choice } = args;
        const response = responses[Math.floor(Math.random() * responses.length)];
        if (choice === 'pierre') {
            if (response === 'Pierre') return msg.say('Pierre! Egalité!');
            if (response === 'Papier') return msg.say('Papier! Trop facile de gagner!');
            if (response === 'Ciseaux') return msg.say('Ciseaux! Merde...');
        } else if (choice === 'papier') {
            if (response === 'Pierre') return msg.say('Pierre! Zut');
            if (response === 'Papier') return msg.say('Papier! Egalité!');
            if (response === 'Ciseaux') return msg.say('Ciseaux! Je te coupe en deux connard!');
        } else if (choice === 'ciseaux') {
            if (response === 'Pierre') return msg.say('Pierre! Je te casse la gueule!');
            if (response === 'Papier') return msg.say('Papier! Putain');
            if (response === 'Ciseaux') return msg.say('Ciseaux! Egalité!');
        }
    }
};