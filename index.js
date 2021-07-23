const configReader = require('./ConfigReader.js')
const discord = require('discord.js')

const bot = new discord.Client()

const configFile = './Config.json'
const configOptions = {'Discord API Token':''}
var config

configReader.readOptions(configFile, configOptions, false).then((config) =>
{
    config = config
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


bot.on('ready', () =>
{
    console.info('[  OK  ] Connected to Discord. Bot is ready.')
})