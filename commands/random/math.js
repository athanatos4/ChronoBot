const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const math = require('mathjs');
const operations = ['+', '-', '*'];

module.exports = class MathGameCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'math',
            group: 'random',
            memberName: 'math',
            description: 'Résous un calcul dans un temps limité',
            args: [
                {
                    key: 'difficulty',
                    prompt: 'Quelle difficulté? `Facile`, `Moyen`, `Difficile`, `Extreme`, ou `Impossible`?',
                    type: 'string',
                    validate: difficulty => {
                        if (['facile', 'moyen', 'difficile', 'extreme', 'impossible'].includes(difficulty.toLowerCase())) return true;
                        return 'La difficulté doit être `facile`, `moyen`, `difficile`, `extreme`, ou `impossible`.';
                    },
                    parse: difficulty => difficulty.toLowerCase()
                }
            ]
        });
    }

    async run(msg, args) {
        if (msg.channel.type !== 'dm')
            if (!msg.channel.permissionsFor(this.client.user).has('EMBED_LINKS'))
                return msg.say('This Command requires the `Embed Links` Permission.');
        const { difficulty } = args;
        const operation = operations[Math.floor(Math.random() * operations.length)];
        let value;
        switch(difficulty) {
            case 'facile':
                value = 10;
                break;
            case 'moyen':
                value = 50;
                break;
            case 'difficile':
                value = 100;
                break;
            case 'extreme':
                value = 1000;
                break;
            case 'impossible':
                value = 10000;
                break;
        }
        const expression = `${Math.floor(Math.random() * value) + 1} ${operation} ${Math.floor(Math.random() * value) + 1}`;
        const solved = math.eval(expression).toString();
        const embed = new RichEmbed()
            .setTitle('Vous avez dix secondes pour répondre:')
            .setDescription(expression);
        msg.embed(embed);
        try {
            const collected = await msg.channel.awaitMessages(res => res.author.id === msg.author.id, {
                max: 1,
                time: 10000,
                errors: ['time']
            });
            if (collected.first().content !== solved)
                return msg.say(`Nope! La réponse correcte est : ${solved}.`);
            return msg.say(`Parfait! ${solved} est la réponse correcte!`);
        } catch (err) {
            return msg.say(`Le temps est écoulé! La réponse correcte est ${solved}.`);
        }
    }
};