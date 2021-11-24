const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const { disableButtons } = require('../utils/utils')
const verify = require('../utils/verify')
const Database = require('st.db');
const ms = require('ms');

module.exports = class RPSGame {
    constructor(options = {}) {
        if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
        if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')
        if(!options.opponent) throw new TypeError('NO_OPPONENT: Please provide an opponent arguement')
        if (typeof options.opponent !== 'object') throw new TypeError('INVALID_OPPONENT: Invalid Discord User object was provided.')
        if (!options.slash_command) options.slash_command = false;
        if (typeof options.slash_command !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: Slash command must be a boolean.')


        if (!options.embed) options.embed = {};
        if (typeof options.embed !== 'object') throw new TypeError('INVALID_EMBED_OBJECT: Embed arguement must be an object.')
        if (!options.embed.title) options.embed.title = 'Rock Paper Scissors';
        if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')
        if (!options.embed.description) options.embed.description = 'Press a button below to make a choice!';
        if (typeof options.embed.description !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')
        if (!options.embed.color) options.embed.color = '#5865F2';
        if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')


        if (!options.buttons) options.buttons = {};
        if (!options.buttons.rock) options.buttons.rock = 'Rock';
        if (typeof options.buttons.rock !== 'string')  throw new TypeError('INVALID_BUTTON: Rock Button must be a string.')
        if (!options.buttons.paper) options.buttons.paper = 'Paper';
        if (typeof options.buttons.paper !== 'string')  throw new TypeError('INVALID_BUTTON: Paper Button must be a string.')
        if (!options.buttons.scissors) options.buttons.scissors = 'Scissors';
        if (typeof options.buttons.scissors !== 'string')  throw new TypeError('INVALID_BUTTON: Scissors Button must be a string.')


        if (!options.emojis) options.emojis = {};
        if (!options.emojis.rock) options.emojis.rock = '🌑';
        if (typeof options.emojis.rock !== 'string')  throw new TypeError('INVALID_EMOJI: Rock Emoji must be a string.')
        if (!options.emojis.paper) options.emojis.paper = '📃';
        if (typeof options.emojis.paper !== 'string')  throw new TypeError('INVALID_EMOJI: Paper Emoji must be a string.')
        if (!options.emojis.scissors) options.emojis.scissors = '✂️';
        if (typeof options.emojis.scissors !== 'string')  throw new TypeError('INVALID_EMOJI: Scissors Emoji must be a string.')

    
        if (!options.askMessage) options.askMessage = 'Hey {opponent}, {challenger} challenged you for a game of Rock Paper Scissors!';
        if (typeof options.askMessage !== 'string')  throw new TypeError('ASK_MESSAGE: Ask Messgae must be a string.')
        if (!options.cancelMessage) options.cancelMessage = 'Looks like they refused to have a game of Rock Paper Scissors. \:(';
        if (typeof options.cancelMessage !== 'string')  throw new TypeError('CANCEL_MESSAGE: Cancel Message must be a string.')
        if (!options.timeEndMessage) options.timeEndMessage = 'Since the opponent didnt answer, i dropped the game!';
        if (typeof options.timeEndMessage !== 'string')  throw new TypeError('TIME_END_MESSAGE: Time End Message must be a string.')
        
        
        if (!options.othersMessage) options.othersMessage = 'You are not allowed to use buttons for this message!';
        if (typeof options.othersMessage !== 'string') throw new TypeError('INVALID_OTHERS_MESSAGE: Others Message must be a string.')
        if (!options.chooseMessage) options.chooseMessage = 'You choose {emoji}!';
        if (typeof options.chooseMessage !== 'string') throw new TypeError('INVALID_CHOOSE_MESSAGE: Choose Message must be a string.')
        if (!options.noChangeMessage) options.noChangeMessage = 'You cannot change your selection!';
        if (typeof options.noChangeMessage !== 'string') throw new TypeError('INVALID_NOCHANGE_MESSAGE: noChange Message must be a string.')
        

        if (!options.gameEndMessage) options.gameEndMessage = 'The game went unfinished :(';
        if (typeof options.gameEndMessage !== 'string')  throw new TypeError('GAME_END_MESSAGE: Game End Message must be a string.')
        if (!options.winMessage) options.winMessage = '{winner} won the game!';
        if (typeof options.winMessage !== 'string')  throw new TypeError('WIN_MESSAGE: Win Message must be a string.')
        if (!options.drawMessage) options.drawMessage = 'It was a draw!';
        if (typeof options.drawMessage !== 'string')  throw new TypeError('DRAW_MESSAGE: Draw Message must be a string.')


        this.inGame = false;
        this.options = options;
        this.opponent = options.opponent;
        this.message = options.message;
    }

    const prof = new Database({path: `databases/profile.json`, crypto: {encrypt:true, password: this.options.password}});
    sendMessage(content) {
        if (this.options.slash_command) return this.message.editReply(content)
        else return this.message.reply(content)
    }


    async startGame() {
        if (this.options.slash_command) {
            if (!this.message.deferred) await this.message.deferReply();
            this.message.author = this.message.user;
        }

        if (this.opponent.bot) return this.sendMessage(this.options.botMessage)
        if (this.opponent.id === this.message.author.id) return this.sendMessage(this.options.yourselfMessage)

        const check = await verify(this.options);

        if (check) {
            this.RPSGame();
        }
    }


    async RPSGame() {
        this.inGame = true;

        const emojis = this.options.emojis;
        const choice = { r: emojis.rock, p: emojis.paper, s: emojis.scissors};

        const embed = new MessageEmbed()
		.setTitle(this.options.embed.title)
 		.setDescription(this.options.embed.description)
        .setColor(this.options.embed.color);
        

        const rock = new MessageButton().setCustomId('r_rps').setStyle('PRIMARY').setLabel(this.options.buttons.rock).setEmoji(emojis.rock)
        const paper = new MessageButton().setCustomId('p_rps').setStyle('PRIMARY').setLabel(this.options.buttons.paper).setEmoji(emojis.paper)
        const scissors = new MessageButton().setCustomId('s_rps').setStyle('PRIMARY').setLabel(this.options.buttons.scissors).setEmoji(emojis.scissors)
        const row = new MessageActionRow().addComponents(rock, paper, scissors)

        const msg = await this.sendMessage({ embeds: [embed], components: [row] })


        let challenger_choice;
        let opponent_choice;
        const filter = m => m;
        const collector = msg.createMessageComponentCollector({
            filter,
            time: ms('1h'),
        }) 


        collector.on('collect', async btn => {
            if (btn.user.id !== this.message.author.id && btn.user.id !== this.opponent.id) return;
            if (btn.user.id == this.message.author.id) {
                if (challenger_choice) {
                    return btn.reply({ content: this.options.noChangeMessage,  ephemeral: true })
                }
                challenger_choice = choice[btn.customId.split('_')[0]];

                btn.reply({ content: this.options.chooseMessage.replace('{emoji}', challenger_choice),  ephemeral: true })

                if (challenger_choice && opponent_choice) {
                    collector.stop()
                    this.getResult(msg, challenger_choice, opponent_choice)
                }
            }
            else if (btn.user.id == this.opponent.id) {
                if (opponent_choice) {
                    return btn.reply({ content: this.options.noChangeMessage,  ephemeral: true })
                }
                opponent_choice = choice[btn.customId.split('_')[0]];

                btn.reply({ content: this.options.chooseMessage.replace('{emoji}', opponent_choice),  ephemeral: true })

                if (challenger_choice && opponent_choice) {
                    collector.stop()
                    this.getResult(msg, challenger_choice, opponent_choice)
                }
            }
        })

        collector.on('end', async(c, r) => {
            if (r === 'time' && this.inGame == true) {
                const endEmbed = new MessageEmbed()
                .setTitle(this.options.embed.endTitle)
                .setColor(this.options.embed.color)
                .setDescription(this.options.gameEndMessage);

                return msg.edit({ embeds: [endEmbed], components: disableButtons(msg.components) })
            }
        })
    }

    getResult(msg, challenger, opponent) {
        let result;
        let title;
        let id;
        let loserId;
        const { rock, paper, scissors } = this.options.emojis;

        if (challenger === opponent) {
            result = this.options.message.replace('{challenger}', this.message.author.toString()).replace('{opponent}', this.opponent.toString()).replace(`{challengerChoice}`, challenger).replace('{opponentChoice}', opponent);
            title = this.options.embed.drawTitle;
            loserId = null;
            id = null;
        } else if (
            (opponent === scissors && challenger === paper) || 
            (opponent === rock && challenger === scissors) || 
            (opponent === paper && challenger === rock)
        ) {
            result = this.options.message.replace('{challenger}', this.message.author.toString()).replace('{opponent}', this.opponent.toString()).replace(`{challengerChoice}`, challenger).replace('{opponentChoice}', opponent)
            title = this.options.winTitle.replace('{winner}', this.opponent.username);
            loserId = this.message.author.id;
            id = this.opponent.id;
        } else {
            result = this.options.message.replace('{challenger}', this.message.author.toString()).replace('{opponent}', this.opponent.toString()).replace(`{challengerChoice}`, challenger).replace('{opponentChoice}', opponent)
            title = this.options.winTitle.replace('{winner}', this.message.author.username);
            loserId = this.opponent.id;
            id = this.message.author.id;
        }

        const finalEmbed = new MessageEmbed()
        .setTitle(title)
        .setColor(this.options.embed.color)
        .setDescription(result);
        msg.edit({ embeds: [finalEmbed], components: disableButtons(msg.components) })
        let price = parseInt(this.options.price);
            if(price < 1) return this.sendMessage(this.options.noPrice);
            if(price && id !== null && loserId !== null) {
           let winnerprofile = prof.get({key: id});
           let loserprofile = prof.get({key: loserId});
           prof.set({key: id, value: {coins: parseInt(winnerprofile.coins + this.options.price)}});
           prof.set({key: loserId, value: {coins: parseInt(loserprofile.coins - this.options.price)}});
       }
    }
}
