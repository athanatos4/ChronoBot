const { Command } = require('discord.js-commando');
const { oneLine } = require('common-tags');

module.exports = class SkipSongCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'skip',
			group: 'music',
			memberName: 'skip',
			description: 'Passe la chanson actuelle.',
			details: oneLine`
				Avec trois personnes ou moins dans le salon, ce sera immédiat.
				Avec au moins quatre personne, un voteskip aura lieu pendant 15 secondes.
				Il faut un tiers des votes pour passer.
				Chaque vote ajoute 5 secondes au temps.
				Les modérateurs peuvent forcer le skip.
			`,
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			}
		});

		this.votes = new Map();
	}

	run(msg, args) {
		const queue = this.queue.get(msg.guild.id);
		if (!queue) return msg.reply('aucune chanson ne joue.');
		if (!queue.voiceChannel.members.has(msg.author.id)) {
			return msg.reply('vous n êtes pas dans un channel vocal.');
		}
		if (!queue.songs[0].dispatcher) return msg.reply('la chanson n a pas commencé'); // eslint-disable-line max-len

		const threshold = Math.ceil((queue.voiceChannel.members.size - 1) / 3);
		const force = threshold <= 1
			|| queue.voiceChannel.members.size < threshold
			|| (msg.member.hasPermission('MANAGE_MESSAGES')
			&& args.toLowerCase() === 'force');
		if (force) return msg.reply(this.skip(msg.guild, queue));

		const vote = this.votes.get(msg.guild.id);
		if (vote && vote.count >= 1) {
			if (vote.users.some(user => user === msg.author.id)) return msg.reply('vous avez déjà voté.');

			vote.count++;
			vote.users.push(msg.author.id);
			if (vote.count >= threshold) return msg.reply(this.skip(msg.guild, queue));

			const time = this.setTimeout(vote);
			const remaining = threshold - vote.count;

			return msg.say(oneLine`
				${vote.count} vote${vote.count > 1 ? 's' : ''} reçus,
				${remaining} plus ${remaining > 1 ? 'are' : 'is'} nécessaires pour passer.
				Cinq secondes de plus! Le vote finira dans ${time} secondes.
			`);
		} else {
			const newVote = {
				count: 1,
				users: [msg.author.id],
				queue: queue,
				guild: msg.guild.id,
				start: Date.now(),
				timeout: null
			};

			const time = this.setTimeout(newVote);
			this.votes.set(msg.guild.id, newVote);
			const remaining = threshold - 1;

			return msg.say(oneLine`
				Starting a voteskip.
				${remaining} more vote${remaining > 1 ? 's are' : ' is'} nécessaires pour passer.
				Le vote finira dans ${time} secondes.
			`);
		}
	}

	skip(guild, queue) {
		if (this.votes.has(guild.id)) {
			clearTimeout(this.votes.get(guild.id).timeout);
			this.votes.delete(guild.id);
		}

		const song = queue.songs[0];
		song.dispatcher.end();

		return `Skipped: **${song}**`;
	}

	setTimeout(vote) {
		const time = vote.start + 15000 - Date.now() + ((vote.count - 1) * 5000);
		clearTimeout(vote.timeout);
		vote.timeout = setTimeout(() => {
			this.votes.delete(vote.guild);
			vote.queue.textChannel.send('Le vote est fini.');
		}, time);

		return Math.round(time / 1000);
	}

	get queue() {
		if (!this._queue) this._queue = this.client.registry.resolveCommand('music:play').queue;

		return this._queue;
	}
};