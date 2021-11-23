const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { disableButtons } = require('../utils/utils')
const verify = require('../utils/verify')
const Database = require('st.db');
const prof = new Database({path: `databases/profile.json`})
const ms = require('ms');

const WIDTH = 10;
const HEIGHT = 9;

module.exports = class Connect4Game {
    constructor(options = {}) {
        if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
        if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')
        if(!options.opponent) throw new TypeError('NO_OPPONENT: Please provide an opponent arguement')
        if (typeof options.opponent !== 'object') throw new TypeError('INVALID_OPPONENT: Invalid Discord User object was provided.')
        if (!options.slash_command) options.slash_command = false;
        if (typeof options.slash_command !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: Slash command must be a boolean.')


        if (!options.embed) options.embed = {};
        if (!options.embed.title) options.embed.title = 'Connect 4';
        if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')
        if (!options.embed.color) options.embed.color = '#5865F2';
        if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')


        if (!options.emojis) options.emojis = {};
        if (!options.emojis.player1) options.emojis.player1 = '🔵';
        if (typeof options.emojis.player1 !== 'string')  throw new TypeError('INVALID_EMOJI: Player1 Emoji must be a string.')
        if (!options.emojis.player2) options.emojis.player2 = '🟡';
        if (typeof options.emojis.player2 !== 'string')  throw new TypeError('INVALID_EMOJI: Player2 Emoji must be a string.')


        if (!options.askMessage) options.askMessage = 'Hey {opponent}, {challenger} challenged you for a game of Connect 4!';
        if (typeof options.askMessage !== 'string')  throw new TypeError('ASK_MESSAGE: Ask Message must be a string.')
        if (!options.cancelMessage) options.cancelMessage = 'Looks like they refused to have a game of Connect4. \:(';
        if (typeof options.cancelMessage !== 'string')  throw new TypeError('CANCEL_MESSAGE: Cancel Message must be a string.')
        if (!options.timeEndMessage) options.timeEndMessage = 'Since the opponent didnt answer, i dropped the game!';
        if (typeof options.timeEndMessage !== 'string')  throw new TypeError('TIME_END_MESSAGE: Time End Message must be a string.')

        
        if (!options.turnMessage) options.turnMessage = '{emoji} | Its turn of player **{player}**.';
        if (typeof options.turnMessage !== 'string')  throw new TypeError('TURN_MESSAGE: Turn Message must be a string.')
        if (!options.waitMessage) options.waitMessage = 'Waiting for the opponent...';
        if (typeof options.waitMessage !== 'string')  throw new TypeError('WAIT_MESSAGE: Wait Message must be a string.')        


        if (!options.gameEndMessage) options.gameEndMessage = 'The game went unfinished :(';
        if (typeof options.gameEndMessage !== 'string')  throw new TypeError('GAME_END_MESSAGE: Game End Message must be a string.')
        if (!options.winMessage) options.winMessage = '{emoji} | **{winner}** won the game!';
        if (typeof options.winMessage !== 'string')  throw new TypeError('WIN_MESSAGE: Win Message must be a string.')
        if (!options.drawMessage) options.drawMessage = 'It was a draw!';
        if (typeof options.drawMessage !== 'string')  throw new TypeError('DRAW_MESSAGE: Draw Message must be a string.')
        if (!options.othersMessage) options.othersMessage = 'You are not allowed to use buttons for this message!';
        if (typeof options.othersMessage !== 'string') throw new TypeError('INVALID_OTHERS_MESSAGE: Others Message must be a string.')


        this.message = options.message;
        this.opponent = options.opponent;
        this.emojis = options.emojis;
        this.gameBoard = [];
        this.options = options;
        this.inGame = false;
        this.redTurn = true;
        // red => author, yellow => opponent
    }

    
    getGameBoard() {
        let str = '';
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                str += '' + this.gameBoard[y * WIDTH + x];
            }
            str += '\n';
        }
        str += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣🔟'
        return str;
    }

    sendMessage(content) {
        if (this.options.slash_command) return this.message.editReply(content)
        else return this.message.reply(content)
    }


    async startGame() {
        if (this.options.slash_command) {
            if (!this.message.deferred) await this.message.deferReply();
            this.message.author = this.message.user;
        }

        if (this.opponent.bot) return this.sendMessage('You can\'t play with bots!')
        if (this.opponent.id === this.message.author.id) return this.sendMessage('You cannot play with yourself!')

        const check = await verify(this.options)

        if (check) {
            this.Connect4Game();
        }
    }


    async Connect4Game() {
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                this.gameBoard[y * WIDTH + x] = this.options.emojis.board;
            }
        }
        this.inGame = true;


        const btn1 = new MessageButton().setStyle('PRIMARY').setEmoji('1️⃣').setCustomId('1_connect4')
        const btn2 = new MessageButton().setStyle('PRIMARY').setEmoji('2️⃣').setCustomId('2_connect4')
        const btn3 = new MessageButton().setStyle('PRIMARY').setEmoji('3️⃣').setCustomId('3_connect4')
        const btn4 = new MessageButton().setStyle('PRIMARY').setEmoji('4️⃣').setCustomId('4_connect4')
        const btn5 = new MessageButton().setStyle('PRIMARY').setEmoji('5️⃣').setCustomId('5_connect4')
        const btn6 = new MessageButton().setStyle('PRIMARY').setEmoji('6️⃣').setCustomId('6_connect4')
        const btn7 = new MessageButton().setStyle('PRIMARY').setEmoji('7️⃣').setCustomId('7_connect4')
        const btn8 = new MessageButton().setStyle('PRIMARY').setEmoji('8️⃣').setCustomId('8_connect4')
        const btn9 = new MessageButton().setStyle('PRIMARY').setEmoji('9️⃣').setCustomId('9_connect4')
        const btn10 = new MessageButton().setStyle('PRIMARY').setEmoji('🔟').setCustomId('10_connect4')
        const row1 = new MessageActionRow().addComponents(btn1, btn2, btn3, btn4)
        const row2 = new MessageActionRow().addComponents(btn5, btn6, btn7, btn8)
        const row3 = new MessageActionRow().addComponents(btn9, btn10)

        const msg = await this.sendMessage({ embeds: [this.GameEmbed()], components: [row1, row2, row3] })

        this.ButtonInteraction(msg);  
    }

    
    GameEmbed() {
        const status = this.options.turnMessage.replace('{emoji}', this.getChip())
        .replace('{player}', this.redTurn ? this.message.author.tag : this.opponent.tag)

        return new MessageEmbed() 
        .setColor(this.options.embed.color)
        .setTitle(this.options.embed.title)
        .setDescription(this.getGameBoard())
        .addField(this.options.embed.statusTitle || 'Status', status)
    } 


    gameOver(result, msg) {
        this.inGame = false;

        const editEmbed = new MessageEmbed()
        .setColor(this.options.embed.color)
        .setTitle(this.options.embed.overTitle)
        .setDescription(this.getGameBoard())
        .addField(this.options.embed.statusTitle || 'Status', this.getResultText(result))
         msg.edit({ embeds: [editEmbed], components: disableButtons(msg.components) });
        if(result.result !== 'tie' || result.result !== 'timeout' || result.result !== 'error') {
            let price = parseInt(this.options.price);
            if(price < 1) return this.sendMessage(this.options.noPrice);
            if(price) {
           let winnerprofile = prof.get({key: result.players.winner.id});
           let loserprofile = prof.get({key: result.players.loser.id});
           prof.set({key: result.players.winner.id, value: {coins: parseInt(winnerprofile.coins + this.options.price)}});
           prof.set({key: result.players.loser.id, value: {coins: parseInt(loserprofile.coins - this.options.price)}});
      }
    }
  }

    
    ButtonInteraction(msg) {
        const collector = msg.createMessageComponentCollector({
            idle: ms('1h'),
        })


        collector.on('collect', async btn => {
            if (btn.user.id !== this.message.author.id && btn.user.id !== this.opponent.id) {
                const authors = this.message.author.tag + 'and' + this.opponent.tag;
                return btn.reply({ content: this.options.othersMessage.replace('{author}', authors),  ephemeral: true })
            }
            
            const turn = this.redTurn ? this.message.author.id : this.opponent.id;
            if (btn.user.id !== turn) {
				return btn.reply({ content: this.options.waitMessage,  ephemeral: true })
			}
            await btn.deferUpdate();


            const id = btn.customId.split('_')[0];
            const column = parseInt(id) - 1;
            let placedX = -1;
            let placedY = -1;


            for (let y = HEIGHT - 1; y >= 0; y--) {
                const chip = this.gameBoard[column + (y * WIDTH)];
                if (chip === this.options.emojis.board) {
                    this.gameBoard[column + (y * WIDTH)] = this.getChip();
                    placedX = column;
                    placedY = y;
                    break;
                }
            }

            if (placedY == 0) {
                if (column > 3) {
                    msg.components[1].components[column % 4].disabled = true;
                } else {
                    msg.components[0].components[column].disabled = true;
                }
            }


            if (this.hasWon(placedX, placedY)) {
                let players;
                if(btn.user.id === this.message.author.id) players = {loser: this.opponent, winner: this.message.author};
                if(btn.user.id === this.opponent.id) players = {loser: this.message.author, winner = this.opponent};
                this.gameOver({ result: 'winner', players: players, emoji: this.getChip()}, msg);
            }
            else if (this.isBoardFull()) {
                this.gameOver({ result: 'tie' }, msg);
            }
            else {
                this.redTurn = !this.redTurn;
                msg.edit({ embeds: [this.GameEmbed()], components: msg.components });
            }
        })

        collector.on('end', async(c, r) => {
            if (r === 'idle' && this.inGame == true) this.gameOver({ result: 'timeout' }, msg)
        })

    }


    hasWon(placedX, placedY) {
        const chip = this.getChip();
        const gameBoard = this.gameBoard;

        //Horizontal Check
        const y = placedY * WIDTH;
        for (var i = Math.max(0, placedX - 3); i <= placedX; i++) {
            var adj = i + y;
            if (i + 3 < WIDTH) {
                if (gameBoard[adj] === chip && gameBoard[adj + 1] === chip && gameBoard[adj + 2] === chip && gameBoard[adj + 3] === chip)
                    return true;
            }
        }
        //Verticle Check
        for (var i = Math.max(0, placedY - 3); i <= placedY; i++) {
            var adj = placedX + (i * WIDTH);
            if (i + 3 < HEIGHT) {
                if (gameBoard[adj] === chip && gameBoard[adj + WIDTH] === chip && gameBoard[adj + (2 * WIDTH)] === chip && gameBoard[adj + (3 * WIDTH)] === chip)
                    return true;
            }
        }
        //Ascending Diag
        for (var i = -3; i <= 0; i++) {
            var adjX = placedX + i;
            var adjY = placedY + i;
            var adj = adjX + (adjY * WIDTH);
            if (adjX + 3 < WIDTH && adjY + 3 < HEIGHT) {
                if (gameBoard[adj] === chip && gameBoard[adj + WIDTH + 1] === chip && gameBoard[adj + (2 * WIDTH) + 2] === chip && gameBoard[adj + (3 * WIDTH) + 3] === chip)
                    return true;
            }
        }
        //Descending Diag
        for (var i = -3; i <= 0; i++) {
            var adjX = placedX + i;
            var adjY = placedY - i;
            var adj = adjX + (adjY * WIDTH);
            if (adjX + 3 < WIDTH && adjY - 3 >= 0) {
                if (gameBoard[adj] === chip && gameBoard[adj - WIDTH + 1] === chip && gameBoard[adj - (2 * WIDTH) + 2] === chip && gameBoard[adj - (3 * WIDTH) + 3] === chip)
                    return true;
            }
        }
        return false;
    }

    getChip() {
        return this.redTurn ? this.emojis.player1 : this.emojis.player2;
    }

    isBoardFull() {
        for (let y = 0; y < HEIGHT; y++)
            for (let x = 0; x < WIDTH; x++)
                if (this.gameBoard[y * WIDTH + x] === this.options.emojis.board)
                    return false;
        return true;
    }

    getResultText(result) {
        if (result.result === 'tie')
            return this.options.drawMessage;
        else if (result.result === 'timeout')
            return this.options.gameEndMessage;
        else if (result.result === 'error')
            return 'ERROR: ' + result.error;
        else
            return this.options.winMessage.replace('{emoji}', result.emoji).replace('{winner}', result.name);
    }
}
