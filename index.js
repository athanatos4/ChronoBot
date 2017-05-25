const Commando = require('discord.js-commando');
const bot = new Commando.Client();

bot.on('ready', () => {
    console.log('Prêt!');
});

bot.login('MzE3MjI3NzM0MzI3NzU0NzUz.DAiH9A.svpw-1sbBYk3PoVMxtyFKrk1jxQ');

bot.registry.registerGroup('random', 'Random');

bot.registry.registerCommandsIn(__dirname + "/commands");

bot.registry.registerDefaults();
