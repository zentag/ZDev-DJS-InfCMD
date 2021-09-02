const mongo = require('../mongo.js')
const settingsSchema = require('../schemas/settings.js')
const prefixes = new Map()

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

  const testguild = client.guilds.cache.get('811390529728020480');
  const data = {
      name,
      description,
      options
  }
  
  const command = await testguild.commands.create(data)
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
    if(mongoURI && message.guild !== null){
      await mongo(mongoURI).then(async (mongoose) => {
        const result = settingsSchema.findOne({ guildId: message.guild.id }, function (err, docs) {
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
        for (const permission of permissions) {
          if ((member !== null && !member.hasPermission(permission)) || member == null) {
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