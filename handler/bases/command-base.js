const mongo = require('../mongo.js')
const settingsSchema = require('../schemas/settings.js')

const validatePermissions = (permissions) => {
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

  for (const permission of permissions) {
    if (!validPermissions.includes(permission)) {
      throw new Error(`Unknown permission node "${permission}"`)
    }
  }
}

module.exports = async (client, commandOptions, file, clientOptions, userCommands) => {
  let {
    aliases,
    identifier = null,
    expectedArgs = '',
    permissionError = 'You do not have permission to run this command.',
    minArgs = 0,
    maxArgs = null,
    permissions = [],
    requiredRoles = [],
    ownerOnly = false,
    testOnly = false,
    callback,
    error = ({ message, error, errortype }) => {
      if(errortype == "EXCEPTION"){
        message.reply("An error has occured, and it has been reported to the developers")
      }      
      console.log(error)
    },
  } = commandOptions
  let {
    prefix,
    testServers,
    ownerId,
    mongoURI,
    ignoreBots = false,
    disabledDefaults = null,
  } = clientOptions
  if(!aliases){
    aliases = [file.replace('.js', '')]
  } else {
    aliases.unshift(file.replace('.js', ''))
  }
  

  
  if(ownerOnly == true && !(ownerId)) console.log(`InfCMD WARNING > Command ${aliases[0]} requires an Owner ID, but it is not defined in initiation`)
  if(testOnly == true && !(testServers)) console.log(`InfCMD WARNING > Command ${aliases[0]} requires Test Servers, but it is not defined in initiation`)
  
  // Ensure the command and aliases are in an array
  if (typeof aliases === 'string') {
    aliases = [aliases]
  }
  if(!callback) return console.log(`InfCMD > Command ${aliases[0]} does not have a callback function`)
  if(identifier !== null) console.log(`InfCMD > Loaded Default Command: "${aliases[0]}"`)
  else console.log(`InfCMD > Loaded Command: "${aliases[0]}"`)
  

  // Ensure the permissions are in an array and are all valid
  if (permissions.length) {
    if (typeof permissions === 'string') {
      permissions = [permissions]
    }

    validatePermissions(permissions)
  }

  // Listen for messages
  client.on('message', async (message) => {
    let different = false
    let disabledCommands = null
    await mongo(mongoURI).then(async (mongoose) => {
      const result = settingsSchema.findOne({ guildId: message.guild.id }, function (err, docs) {
          if (err){
              console.log(err)
          }
          else{
              if(!docs) return
              if(docs.disabledCommands.length > 0){
                disabledCommands = docs.disabledCommands
                if(disabledCommands !== null && disabledCommands.includes(aliases[0])) return
              }
              if(prefix !== docs.prefix){
                different = true
              } else {
                return
              }
              if(docs.prefix){
                prefix = docs.prefix;
              }
              return
          }
      });
    });
    if(ignoreBots == true && message.author.bot) return
    const { member, content, guild } = message
    if(testOnly == true && !(testServers.includes(message.guild.id))) return 
    if(ownerOnly == true && !(message.author.id == ownerId)) return 
    for (const alias of aliases) {
      const command = `${prefix}${alias.toLowerCase()}`

      if (
        content.toLowerCase().startsWith(`${command} `) ||
        content.toLowerCase() === command
      ) {
        // A command has been ran
        // Split on any number of spaces
        const arguments = content.split(/[ ]+/)

        // Remove the command which is the first index
        arguments.shift()
        // Ensure the user has the required permissions
        for (const permission of permissions) {
          if (!member.hasPermission(permission)) {
            const errorObj = {
              message: message,
              args: arguments,
              text: arguments.join(' '),
              client: client,
              error: "User doesn't have correct Permissions",
              errortype: "PERMISSION"
            }
            error(errorObj)
            message.reply(permissionError)
            return
          }
        }

        // Ensure the user has the required roles
        for (const requiredRole of requiredRoles) {
          const role = guild.roles.cache.find(
            (role) => role.name === requiredRole
          )

          if (!role || !member.roles.cache.has(role.id)) {
            const errorObj = {
              message: message,
              args: arguments,
              text: arguments.join(' '),
              client: client,
              error: "User doesn't have correct Roles",
              errortype: "ROLE"
            }
            error(errorObj)
            message.reply(
              `You must have the "${requiredRole}" role to use this command.`
            )
            return
          }
        }

        

        // Ensure we have the correct number of arguments
        if (
          arguments.length < minArgs ||
          (maxArgs !== null && arguments.length > maxArgs)
        ) {
          message.reply(
            `Incorrect syntax! Use ${prefix}${alias} ${expectedArgs}`
          )
          return
        }
        if(identifier !== null){
          const infoObj = {
            message: message,
            args: arguments,
            text: arguments.join(' '),
            client: client,
            prefix: prefix,
            mongoURI: mongoURI,
            userCommands: userCommands,
          }
          
          // Handle the custom command code
          
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
          const infoObj = {
            message: message,
            args: arguments,
            text: arguments.join(' '),
            client: client,
            prefix: prefix,
          }
          
          // Handle the custom command code
          if(different == true) return message.reply("Sorry, but you'll have to send the command again! It should work next time.")
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
        }
        

        return
      }
    }
  })
}