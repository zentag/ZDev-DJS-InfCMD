const { init } = require('./handler/infcmd.js')
const Discord = require('discord.js')
const client = new Discord.Client()
require('dotenv').config()

client.on('ready', async () => {
  console.log('The client is ready!')

  init(client, {
      commandsDir: 'commands',
      featuresDir: 'features',
      prefix: 'funny?',
      ownerId: '521115847801044993',
      testServers: ['811390529728020480']
  })
})

client.login(process.env.token)
