const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js')
const { disableButtons } = require('../utils/utils');
const ms = require('ms');
const moment = require('moment');

       const WIDTH = 17;
       const HEIGHT = 18;

module.exports = class SnakeGame {
    constructor(options = {}) {
        if (!options.message) throw new TypeError('NO_MESSAGE: Please provide a message arguement')
        if (typeof options.message !== 'object') throw new TypeError('INVALID_MESSAGE: Invalid Discord Message object was provided.')
        if (!options.slash_command) options.slash_command = false;
        if (typeof options.slash_command !== 'boolean') throw new TypeError('INVALID_COMMAND_TYPE: Slash command must be a boolean.')
        

        if (!options.embed) options.embed = {};
        if (!options.embed.title) options.embed.title = 'Snake';
        if (typeof options.embed.title !== 'string')  throw new TypeError('INVALID_TITLE: Embed Title must be a string.')
        if (!options.embed.color) options.embed.color = '#5865F2';
        if (typeof options.embed.color !== 'string')  throw new TypeError('INVALID_COLOR: Embed Color must be a string.')

if(!options.overembed) options.overembed = {};
// overTitle - overMsg - overcolor - overth 
        if (!options.snake) options.snake = {};
        if (!options.snake.head) options.snake.head = '🟢';
        if (typeof options.snake.head !== 'string')  throw new TypeError('INVALID_EMOJI: Snake Head Emoji must be a string.')
        if (!options.snake.body) options.snake.body = '🟩';
        if (typeof options.snake.body !== 'string')  throw new TypeError('INVALID_EMOJI: Snake Body Emoji must be a string.')
        if (!options.snake.tail) options.snake.tail = '🟢';
        if (typeof options.snake.tail !== 'string')  throw new TypeError('INVALID_EMOJI: Snake Tail Emoji must be a string.')
        if (!options.snake.over) options.snake.over = '💀';
        if (typeof options.snake.over !== 'string')  throw new TypeError('INVALID_EMOJI: Snake Tail Emoji must be a string.')


        if (!options.emojis) options.emojis = {};
        if (!options.emojis.board) options.emojis.board = '⬛';
        if (typeof options.emojis.board !== 'string')  throw new TypeError('INVALID_EMOJI: Board Emoji must be a string.')
        if (!options.emojis.food) options.emojis.food = '🍎';
        if (typeof options.emojis.food !== 'string')  throw new TypeError('INVALID_EMOJI: Food Emoji must be a string.')
        

        if (!options.emojis.up) options.emojis.up = '⬆️';
        if (typeof options.emojis.up !== 'string')  throw new TypeError('INVALID_EMOJI: Up Emoji must be a string.')
        if (!options.emojis.left) options.emojis.left = '⬅️';
        if (typeof options.emojis.left !== 'string')  throw new TypeError('INVALID_EMOJI: Up Emoji must be a string.')
        if (!options.emojis.down) options.emojis.down = '⬇️';
        if (typeof options.emojis.down !== 'string')  throw new TypeError('INVALID_EMOJI: Up Emoji must be a string.')
        if (!options.emojis.right) options.emojis.right = '➡️';
        if (typeof options.emojis.right !== 'string')  throw new TypeError('INVALID_EMOJI: Up Emoji must be a string.')


        if (!options.foods) options.foods = [];
        if (typeof options.foods !== 'object')  throw new TypeError('INVALID_FOODS: Foods Emojis must be a array.')
        if (!options.stopButton) options.stopButton = 'Stop';
        if (typeof options.stopButton !== 'string') throw new TypeError('INVALID_STOP_BUTTON: Stop Button must be a string.')
        // Other : scoretitle,

        this.snake = [{ x: 5, y: 5 }];
        this.apple = { x: 1, y: 1 };
        this.snakeLength = 1;
        this.isInGame = false;
        this.options = options;
        this.message = options.message;
        this.gameBoard = [];
        this.score = 0;
        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                this.gameBoard[y * WIDTH + x] = this.options.emojis.board;
            }
        }
    }

    getGameBoard() {
        let str = '';
        let emojis =  this.options.snake;


        for (let y = 0; y < HEIGHT; y++) {
            for (let x = 0; x < WIDTH; x++) {
                if (x ==  this.apple.x && y == this.apple.y) {
                    str += this.options.emojis.food;
                    continue;
                }

                let flag = true;
                for (let s = 0; s < this.snake.length; s++) {
                    if (x === this.snake[s].x && y === this.snake[s].y) {

                        if (s == 0) {
                            if (this.isInGame || this.score == HEIGHT * WIDTH)
                                str += emojis.head;
                            else
                                str = this.options.over.head; 

                        }
                        else if (s === this.snake.length - 1) {
                            str += emojis.tail;
                        }
                        else {
                            str += emojis.body
                        }
                        flag = false;
                    }
                }

                if (flag) 
                    str += this.gameBoard[y * WIDTH + x];
            }
            str += '\n'; 
        }
        return str;
    }


    checkSnake(pos) {
        return this.snake.find(sPos => sPos.x == pos.x && sPos.y == pos.y);
    };


    newFoodLoc() {
        let newApplePos = { x: 0, y: 0 };
        do {
            newApplePos = { x: parseInt(Math.random() * WIDTH), y: parseInt(Math.random() * HEIGHT) };
        } while (this.checkSnake(newApplePos))

        if (this.options.foods.length) {
            this.options.emojis.food = this.options.foods[Math.floor(Math.random()*this.options.foods.length)];
        }

        this.apple.x = newApplePos.x;
        this.apple.y = newApplePos.y;
    }
    

    async sendMessage(content) {
		if (this.options.slash_command) return await this.message.editReply(content)
		return await this.message.reply(content)
	}
    

    async startGame() {
        if (this.options.slash_command) {
            if (!this.message.deferred) await this.message.deferReply();
            this.message.author = this.message.user;
        }
        const emojis = this.options.emojis;
        this.isInGame = true;
        this.snakeLength = 1;
        this.snake = [{ x: 5, y: 5 }];
        this.newFoodLoc();

        
        const embed = new MessageEmbed()
        .setColor(this.options.embed.color)
        .setDescription(this.getGameBoard() + `**${this.options.emojis.food} ${this.options.embed.scoretitle} :** ${this.score}\n**🏆 ${this.options.lvltitle} :** 0`);


        const up = new MessageButton().setEmoji(emojis.up).setStyle('PRIMARY').setCustomId('snake_up')
        const left = new MessageButton().setEmoji(emojis.left).setStyle('PRIMARY').setCustomId('snake_left')
        const down = new MessageButton().setEmoji(emojis.down).setStyle('PRIMARY').setCustomId('snake_down')
        const right = new MessageButton().setEmoji(emojis.right).setStyle('PRIMARY').setCustomId('snake_right')
        const stop = new MessageButton().setLabel(this.options.stopButton).setStyle('DANGER').setCustomId('snake_stop')

        const dis1 = new MessageButton().setLabel('\u200b').setStyle('SECONDARY').setCustomId('dis1').setDisabled(true)
        const dis2 = new MessageButton().setLabel('\u200b').setStyle('SECONDARY').setCustomId('dis2').setDisabled(true)


        const row1 = new MessageActionRow().addComponents(dis1, up, dis2, stop)
        const row2 = new MessageActionRow().addComponents(left, down, right)


        const msg = await this.sendMessage({ embeds: [embed], components: [row1, row2] })

        this.ButtonInteraction(msg)
    }


    move(msg) {
        if (this.apple.x == this.snake[0].x && this.apple.y == this.snake[0].y) {
            this.score += 1;
            this.snakeLength++;
            this.newFoodLoc();
            this.lvl = parseInt(this.score / 10);
        }

        const moveEmbed = new MessageEmbed()
        .setColor(this.options.embed.color)
        .setDescription(this.getGameBoard() + `**${this.options.emojis.food} ${this.options.embed.scoretitle} :** ${this.score}\n**🏆 ${this.options.lvltitle} :** ${this.lvl || '0'}`);

        msg.edit({ embeds: [moveEmbed], components: msg.components }) 
    }


    async gameOver(msg) {
        let overembed = new MessageEmbed()
        .setColor(this.options.embed.color)
        .setDescription(this.getGameBoard() + '\n' + `**${this.options.emojis.food} ${this.options.embed.scoretitle} :** ${this.score}\n**🏆 ${this.options.lvltitle} :** 0`);
        let time = this.message.createdAt / 1000;
        this.isInGame = false;
        const editEmbed = new MessageEmbed()
        .setColor(this.options.overembed.overcolor)
        .setTitle(this.options.overembed.overTitle)
        .addField(`${this.options.embed.scoretitle}`, `${this.score}`)
        .addField(`${this.options.lvltitle}`, `${this.lvl || '0'}`)
        .addField(`${this.options.overembed.timetitle}`, `<t:${parseInt(time)}:R>`)
        .setThumbnail(this.options.overembed.overth);

        return await msg.edit({ embeds: [editEmbed], components: disableButtons(msg.components) })
    }


    ButtonInteraction(msg) {
        const filter = m => m;
        const collector = msg.createMessageComponentCollector({
            filter,
            idle: ms('1h')
        })

        collector.on('collect', async btn => {
            if (btn.user.id !== this.message.author.id) return;

            await btn.deferUpdate();
            const snakeHead = this.snake[0];
            const nextPos = { x: snakeHead.x, y: snakeHead.y };


            if (btn.customId === 'snake_left') {
                let nextX = snakeHead.x - 1;

                if (nextX < 0) {
                    nextPos.x = 0;
                    return this.gameOver(msg);
                }
                nextPos.x = nextX;
            }
            else if (btn.customId === 'snake_right') {
                let nextX = snakeHead.x + 1;

                if (nextX >= WIDTH) {
                    nextPos.x = WIDTH - 1;
                    return this.gameOver(msg);
                }
                nextPos.x = nextX;
            }
            else if (btn.customId === 'snake_up') {
                let nextY = snakeHead.y - 1;

                if (nextY < 0) {
                    nextPos.y = 0;
                    return this.gameOver(msg);
                }
                nextPos.y = nextY;
            }
            else if (btn.customId === 'snake_down') {
                let nextY = snakeHead.y + 1;

                if (nextY >= HEIGHT) {
                    nextPos.y = HEIGHT - 1;
                    return this.gameOver(msg);
                }
                nextPos.y = nextY;
            }
            else if (btn.customId === 'snake_stop') {
                this.gameOver(msg)
                return collector.stop();
            }

            if (this.checkSnake(nextPos)) {
                this.gameOver(msg);
            }
            else {
                this.snake.unshift(nextPos);
                if (this.snake.length > this.snakeLength)
                    this.snake.pop();

                this.move(msg);    
            }
        })

        collector.on('end', async() => {
            if (this.isInGame == true) this.gameOver(msg);
        })
    }
}
