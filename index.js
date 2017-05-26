const Commando = require('discord.js-commando');

const client = new Commando.Client({
    owner : '317227734327754753'
});

client.registry.registerGroups([
        ['random', 'Random'],
        ['music', 'Music']
]);

client.registry.registerDefaults();

client.registry.registerCommandsIn(__dirname + "/commands");

client.on('ready', () => {
    console.log('Prêt!');
});

client.on('message', message => {
    if (message.content === 'Salut') {
        message.reply('Ta gueule');
    }
});

client.on('guildMemberAdd', member => {
    member.guild.defaultChannel.send('Bienvenue sur le serveur, ${member}!');
});

client.login('MzE3MjI3NzM0MzI3NzU0NzUz.DAiH9A.svpw-1sbBYk3PoVMxtyFKrk1jxQ');