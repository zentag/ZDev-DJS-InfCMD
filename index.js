const { init } = require('./handler/infcmd.js')
const { Client, Intents} = require('discord.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
require('dotenv').config()


client.on('ready', async () => {
  console.log('The client is ready!')
  
  init(client, {
      commandsDir: 'commands',
      featuresDir: 'features',
      ownerId: '521115847801044993',
      testServers: ['811390529728020480'],
      testing: false,
      mongoURI: process.env.mongoPath,
  })
})

client.login(process.env.token)
