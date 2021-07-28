const configReader = require('./ConfigReader.js')
const discord = require('discord.js')
const SlashCommandInterface = require('./SlashCommands.js')
const sqlite3 = require('sqlite3').verbose()

const bot = new discord.Client()

const configFile = './Config.json'
const configOptions = {'Discord API Token':''}
var config

const commands = new SlashCommandInterface(bot)

const db = new sqlite3.Database('Servers.db')

db.run('CREATE TABLE IF NOT EXISTS serverData (id INTEGER PRIMARY KEY AUTOINCREMENT, classChannel TEXT, lastWork TEXT, announceChannel TEXT, lastAnnounce TEXT)')

configReader.readOptions(configFile, configOptions, false).then((readConfig) =>
{
    config = readConfig
    console.info('[  OK  ] Succsfully read configuration file.')

    bot.login(config['Discord API Token']).then(() =>
    {        
        console.info('[  OK  ] Successfully logged in to Discord.')
    }).catch((error) =>
    {
        console.error('[ FAIL ] Error logging in to Discord:', error)
        process.exit(1)
    })
}).catch((error) =>
{
    console.error('[ FAIL ] Error reading configuration file:', error)
    process.exit(1)
})

function handlePing(interaction)
{
    commands.respondToInteraction(interaction, 'Pong!').catch((error) => console.error('[ FAIL ] Error responding to \"ping\" command:', error))
}

function sendWelcome(guild)
{
    return new Promise((resolve, reject) =>
    {
        const systemChannel = guild.systemChannel

        if (systemChannel != null)
        {
            const canSend = systemChannel.permissionsFor(guild.me).has('SEND_MESSAGES')
            const canView = systemChannel.permissionsFor(guild.me).has('VIEW_CHANNEL')
            const canEmbed = systemChannel.permissionsFor(guild.me).has('EMBED_LINKS')

            if (canSend && canView && canEmbed)
            {
                embed = new discord.MessageEmbed()
                    .setTitle('Hello, class!')
                    .setDescription('I\'m Mrs. Patterson, your AP English Literature and Composition Teacher.')
                    .setColor('BLUE')
                    .setImage(bot.user.displayAvatarURL())
                    .addField('Commands', 'I operate using slash commands, which you can use by typing \'/\' and then veiwing the names of commands. I don\'t do much now, but more features will be added later.')
                    .addField('Code', 'Due to the use of the [GNU GPL v3.0 license](https://www.gnu.org/licenses/gpl-3.0.en.html), we are required to disclose the underlying code with all users of our service. You can view it [here](https://github.com/MRegirouard/Mrs.Patterson-Bot) on GitHub.')
                    .addField('Issues', 'If you encounter any issues, please report them on GitHub [here](https://github.com/MRegirouard/Mrs.Patterson-Bot/issues/new). Please check if your issue has already been posted. We will investigate as soon as possible.')
                    .addField('Authors', 'Created and maintained with lots of hard work by <@592832907358502961> and <@342775611003240448>. View our GitHub profiles [here](https://github.com/MRegirouard) and [here](https://github.com/Garebear13).')
                    
                systemChannel.send(embed).then((result) => resolve(result)).catch((error) => reject(error))
            }
            else
               reject('Unable to send hello message to system channel: the bot lacks the required permissions.')
        }
        else
           reject('Unable to send hello message to system channel: the system channel does not exist in this guild.')
    })
}

bot.on('ready', () =>
{
    console.info('[  OK  ] Connected to Discord. Bot is ready.')

    commands.listenForCommand('ping', (interaction) => handlePing(interaction))
})

bot.on('guildCreate', (guild) =>
{
    console.info('[  OK  ] Joined a new guild:', guild.name)

    commands.postCommand({name: 'ping', description: 'Test connection.'}, guild.id).then((response) =>
    {
        console.debug('[  OK  ] \"ping\" command posted successfully.')
    })
    .catch((error) =>
    {
        console.error('[ FAIL ] Failed to post \"ping\" command in guild', guild.name,':', error)
    })

    sendWelcome(guild).then((result) =>
    {
        console.info('[  OK  ] Successfully sent hello message to new guild.')
    }).catch((error) =>
    {
        console.error('[ FAIL ] Error sending hello message to new gulid:', error)
    })
})