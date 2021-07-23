const configReader = require('./ConfigReader.js')
const discord = require('discord.js')
const SlashCommandInterface = require('./SlashCommands.js')

const bot = new discord.Client()

const configFile = './Config.json'
const configOptions = {'Discord API Token':''}
var config

const commands = new SlashCommandInterface(bot)

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
})