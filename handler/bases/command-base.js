const mongo = require('../mongo.js')
const settingsSchema = require('../schemas/settings.js')
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Permissions } = require('discord.js');
const prefixes = new Map()

const rest = new REST({ version: '9' }).setToken(process.env.token);

const validatePermissions = (permissions) => {
  // All discord permissions
  const validPermissions = [
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'ADMINISTRATOR',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS',
    'VIEW_AUDIT_LOG',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'VIEW_GUILD_INSIGHTS',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS',
  ]
  // check each permission in each command
  for (const permission of permissions) {
    if (!validPermissions.includes(permission)) {
      throw new Error(`Unknown permission node "${permission}"`)
    }
  }
}

module.exports = async (client, commandOptions, file, clientOptions, userCommands) => {
  // deconstruct stuff from commands
  let {
    callback,
    buttons,
    buttonList = [],
    identifier = null,
    name = null,
    description = null,
    ownerOnly = false,
    testOnly = false,
    permissions = [],
    requiredRoles = [],
    options = [],
  } = commandOptions
  // deconstruct stuff from client
  let {
    testServers,
    ownerId,
    mongoURI = null,
    testing = false,
    ignoreBots = false,
    disabledDefaults = null,
    defaultError = null,
  } = clientOptions
  if(name == null) return console.log(`InfCMD WARNING > Command ${file.replace(".js", "")} doesn't have required field "name"`)
  if(description == null) return console.log(`InfCMD WARNING > Command ${file.replace(".js", "")} doesn't have required field "description"`)
  // check for owner and test commands without proper configuration
  if(ownerOnly == true && !(ownerId)) console.log(`InfCMD WARNING > Command ${name} requires an Owner ID, but it is not defined in initiation`)
  if(testOnly == true && !(testServers)) console.log(`InfCMD WARNING > Command ${name} requires Test Servers, but it is not defined in initiation`)
  // check for identifier(for default commands) and callback functions
  if(!callback) return console.log(`InfCMD > Command ${name} does not have a callback function`)
  if(identifier !== null) console.log(`InfCMD > Loaded Default Command: "${name}"`)
  else console.log(`InfCMD > Loaded Command: "${name}"`)
  // check that permissions are still valid
  if (permissions.length) {
    if (typeof permissions === 'string') {
      permissions = [permissions]
    }

    validatePermissions(permissions)
  }
  for(const option in options){
    switch(options[option].type){
      case "STRING":
        options[option].type = 3
        break;
      case "INT":
        options[option].type = 4
        break;
      case "USER":
        options[option].type = 6
        break;
      case "ROLE":
        options[option].type = 8
        break;
      case "SUB-CMD":
        options[option].type = 1
        break;
      case "SUB-CMD-GROUP":
        options[option].type = 2
        break;
      case "CHANNEL":
        options[option].type = 7
        break;
      case "BOOL":
        options[option].type = 5
        break;
      case "MENTIONABLE":
        options[option].type = 9
        break;
      case "FLOAT":
        options[option].type = 10
        break;
    }
  }

  const data = [{
      name,
      description,
      options
  }]
  if(testing == true){ 
    for(const server in testServers){
      await rest.put(Routes.applicationGuildCommands(client.user.id, testServers[server]), { body: data },)
    }
  }
  else await rest.put(Routes.applicationCommands(client.user.id), { body: data },)
  // make listener for messages
  client.on('interactionCreate', async (interaction) => {
    const passthroughObj = {
      interaction,
      client
    }
    if(interaction.isButton() && buttons && buttonList !== [] && buttonList.includes(interaction.customId)) buttons(passthroughObj)
    if(!interaction.isCommand()) return
    // set disabled to null every message
    let disabledCommands = null
    // check db
    if(mongoURI && interaction.guild !== null){
      await mongo(mongoURI).then(async (mongoose) => {
        const result = settingsSchema.findOne({ guildId: interaction.guild.id }, function (err, docs) {
            if (err){
                console.log(err)
            }
            else{
                if(!docs) return
                // disable the needed commands (per server)
                if(docs.disabledCommands.length > 0){
                  disabledCommands = docs.disabledCommands
                  if(disabledCommands !== null && disabledCommands.includes(name)) return
                }
                return
            }
        });
      });
    }
    const { member, guild } = interaction
    // check for valid testing and owneronly permissions
    if(testOnly == true && !(testServers.includes(guild.id))) return 
    if(ownerOnly == true && !(member.id == ownerId)) return 
    // check each name for the command
      if (
        interaction.commandName == name.toLowerCase()
      ) {
        // check for required permissions
        for (let permission of permissions) {
          switch(permission){
            case 'CREATE_INSTANT_INVITE':
              permission = Permissions.FLAGS.CREATE_INSTANT_INVITE
              break;
            case 'KICK_MEMBERS':
              permission = Permissions.FLAGS.KICK_MEMBERS
              break;
            case 'BAN_MEMBERS':
              permission = Permissions.FLAGS.BAN_MEMBERS
              break;
            case 'ADMINISTRATOR':
              permission = Permissions.FLAGS.ADMINISTRATOR
              break;
            case 'MANAGE_CHANNELS':
              permission = Permissions.FLAGS.MANAGE_CHANNELS
              break;
            case 'MANAGE_GUILD':
              permission = Permissions.FLAGS.MANAGE_GUILD
              break;
            case 'ADD_REACTIONS':
              permission = Permissions.FLAGS.ADD_REACTIONS
              break;
            case 'VIEW_AUDIT_LOG':
              permission = Permissions.FLAGS.VIEW_AUDIT_LOG
              break;
            case 'PRIORITY_SPEAKER':
              permission = Permissions.FLAGS.PRIORITY_SPEAKER
              break;
            case 'STREAM':
              permission = Permissions.FLAGS.STREAM
              break;
            case 'VIEW_CHANNEL':
              permission = Permissions.FLAGS.VIEW_CHANNEL
              break;
            case 'SEND_MESSAGES':
              permission = Permissions.FLAGS.SEND_MESSAGES
              break;
            case 'SEND_TTS_MESSAGES':
              permission = Permissions.FLAGS.SEND_TTS_MESSAGES
              break;
            case 'MANAGE_MESSAGES':
              permission = Permissions.FLAGS.MANAGE_MESSAGES
              break;
            case 'EMBED_LINKS':
              permission = Permissions.FLAGS.EMBED_LINKS
              break;
            case 'ATTACH_FILES':
              permission = Permissions.FLAGS.ATTACH_FILES
              break;
            case 'READ_MESSAGE_HISTORY':
              permission = Permissions.FLAGS.READ_MESSAGE_HISTORY
              break;
            case 'MENTION_EVERYONE':
              permission = Permissions.FLAGS.MENTION_EVERYONE
              break;
            case 'USE_EXTERNAL_EMOJIS':
              permission = Permissions.FLAGS.USE_EXTERNAL_EMOJIS
              break;
            case 'VIEW_GUILD_INSIGHTS':
              permission = Permissions.FLAGS.VIEW_GUILD_INSIGHTS
              break;
            case 'CONNECT':
              permission = Permissions.FLAGS.CONNECT
              break;
            case 'SPEAK':
              permission = Permissions.FLAGS.SPEAK
              break;
            case 'MUTE_MEMBERS':
              permission = Permissions.FLAGS.MUTE_MEMBERS
              break;
            case 'DEAFEN_MEMBERS':
              permission = Permissions.FLAGS.DEAFEN_MEMBERS
              break;
            case 'MOVE_MEMBERS':
              permission = Permissions.FLAGS.MOVE_MEMBERS
              break;
            case 'USE_VAD':
              permission = Permissions.FLAGS.USE_VAD
              break;
            case 'CHANGE_NICKNAME':
              permission = Permissions.FLAGS.CHANGE_NICKNAME
              break;
            case 'MANAGE_NICKNAMES':
              permission = Permissions.FLAGS.MANAGE_NICKNAMES
              break;
            case 'MANAGE_ROLES':
              permission = Permissions.FLAGS.MANAGE_ROLES
              break;
            case 'MANAGE_WEBHOOKS':
              permission = Permissions.FLAGS.MANAGE_WEBHOOKS
              break;
            case 'MANAGE_EMOJIS_AND_STICKERS':
              permission = Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS
              break;
            case 'USE_EXTERNAL_STICKERS':
              permission = Permissions.FLAGS.USE_EXTERNAL_STICKERS
              break;
            case 'MANAGE_THREADS':
              permission = Permissions.FLAGS.MANAGE_THREADS
              break;
            case 'USE_PUBLIC_THREADS':
              permission = Permissions.FLAGS.USE_PUBLIC_THREADS
              break;
            case 'USE_PRIVATE_THREADS':
              permission = Permissions.FLAGS.USE_PRIVATE_THREADS
              break;
          }
          if ((member !== null && !member.permissions.has([permission])) || member == null) {
            const errorObj = {
              message: message,
              args: arguments,
              text: arguments.join(' '),
              client: client,
              permission: permission,
              error: "User doesn't have correct Permissions",
              errortype: "PERMISSION"
            }
            error(errorObj)
            return;
          }
        }

        // check for required roles
        for (const requiredRole of requiredRoles) {
          const role = guild.roles.cache.find(
            (role) => role.name === requiredRole
          )

          if (!role || !member.roles.cache.has(role.id)) {
            // pass to error handling
            const errorObj = {
              message: message,
              args: arguments,
              text: arguments.join(' '),
              client: client,
              error: "User doesn't have correct Roles",
              errortype: "ROLE",
              rr: requiredRole,
            }
            error(errorObj)
            return
          }
        }
        // check if this is a default command
        if(identifier !== null){
          const infoObj = {
            message: message,
            args: arguments,
            text: arguments.join(' '),
            client: client,
            prefix: message.guild ? prefixes.get(message.guild.id) : prefix,
            mongoURI: mongoURI,
            userCommands: userCommands,
          }
          
          // handle the default command
          
          try{
            callback(infoObj)
          } catch(e) {
            const errorObj = {
              message: message,
              args: arguments,
              text: arguments.join(' '),
              client: client,
              error: e,
              errortype: "EXCEPTION"
            }
            error(errorObj)
          }
        } else {
          // this is a non-default command
          const infoObj = {
            interaction
          }
          
          // handle the user's command
          try{
            callback(infoObj)
          } catch(e) {
            console.log(e)
          }
        }
        

        return
      }
  })
}