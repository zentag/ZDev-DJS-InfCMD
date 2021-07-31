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
  // define the default error
  const _defaultError = ({ message, error, errortype, rr, permission }) => {
    if(errortype == "EXCEPTION") message.reply("An error has occured, and it has been reported to the developers")
    else if(errortype == "ROLE") message.reply(`You must have the role "${rr}" to run this command`)
    else if(errortype == "PERMISSION") message.reply(`You must have the permission "${permission}" to run this command`)
    if(errortype == "EXCEPTION") console.log(error)
  }
  // deconstruct stuff from commands
  let {
    aliases,
    identifier = null,
    expectedArgs = '',
    minArgs = 0,
    maxArgs = null,
    permissions = [],
    requiredRoles = [],
    ownerOnly = false,
    testOnly = false,
    callback,
    error = ({ message, error, errortype, rr, permission }) => {
      if(errortype == "EXCEPTION") message.reply("An error has occured, and it has been reported to the developers")
      else if(errortype == "ROLE") message.reply(`You must have the role "${rr}" to run this command`)
      else if(errortype == "PERMISSION") message.reply(`You must have the permission "${permission}" to run this command`)
      if(errortype == "EXCEPTION") console.log(error)
    },
  } = commandOptions
  // deconstruct stuff from client
  let {
    prefix,
    testServers,
    ownerId,
    mongoURI = null,
    ignoreBots = false,
    disabledDefaults = null,
    defaultError = null,
  } = clientOptions
  // add the file name to aliases
  if(!aliases){
    aliases = [file.replace('.js', '')]
  } else {
    aliases.unshift(file.replace('.js', ''))
  }
  // set up prefixes
  if(mongoURI){
    await mongo(mongoURI).then(async (mongoose) => {
      settingsSchema.find({}, function (err, docs) {
          if (err){
              console.log(err)
          }
          else{
            docs.map(doc => {
              if(doc.prefix){
                prefixes.set(doc.guildId, doc.prefix)
              }
            })
          }
      });
    });
  }
  // check for owner and test commands without proper configuration
  if(ownerOnly == true && !(ownerId)) console.log(`InfCMD WARNING > Command ${aliases[0]} requires an Owner ID, but it is not defined in initiation`)
  if(testOnly == true && !(testServers)) console.log(`InfCMD WARNING > Command ${aliases[0]} requires Test Servers, but it is not defined in initiation`)
  
  // check if aliases is an array
  if (typeof aliases === 'string') {
    aliases = [aliases]
  }
  // check for identifier(for default commands) and callback functions
  if(!callback) return console.log(`InfCMD > Command ${aliases[0]} does not have a callback function`)
  if(identifier !== null) console.log(`InfCMD > Loaded Default Command: "${aliases[0]}"`)
  else console.log(`InfCMD > Loaded Command: "${aliases[0]}"`)
  
  // check for defaultError and set it
  if(defaultError !== null && error == _defaultError) error = defaultError
  // check that permissions are still valid
  if (permissions.length) {
    if (typeof permissions === 'string') {
      permissions = [permissions]
    }

    validatePermissions(permissions)
  }

  // make listener for messages
  client.on('message', async (message) => {

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
                // if there's no document, set prefix to default
                if(!docs) return prefixes.set(message.guild.id, prefix)
                // disable the needed commands (per server)
                if(docs.disabledCommands.length > 0){
                  disabledCommands = docs.disabledCommands
                  if(disabledCommands !== null && disabledCommands.includes(aliases[0])) return
                }
                // return if same prefix
                if(prefix == docs.prefix) return
                // if prefix, and it's not the same, set it to the correct prefix
                if(docs.prefix){
                  if(prefixes.get(message.guild.id) && prefixes.get(message.guild.id) == docs.prefix) return
                  prefixes.set(message.guild.id, docs.prefix);
                }
                return
            }
        });
      });
    } else if(message.guild !== null){
      // if no mongoURI set the default prefix
      prefixes.set(message.guild.id, prefix)
    }
    // check for ignoring bots
    if(ignoreBots == true && message.author.bot) return
    // destructure things from the message
    const { member, content, guild } = message
    // check for valid testing and owneronly permissions
    if(testOnly == true && !(testServers.includes(message.guild.id))) return 
    if(ownerOnly == true && !(message.author.id == ownerId)) return 
    // check each alias for the command
    for (const alias of aliases) {
      // register command template
      const command = `${message.guild ? prefixes.get(message.guild.id) : prefix || prefix}${alias.toLowerCase()}`
      // see if the command was called
      if (
        content.toLowerCase().startsWith(`${command} `) ||
        content.toLowerCase() === command ||
        content.toLowerCase().startsWith(`<@!${client.user.id}> ${alias}`)
      ) {
        // check if mention prefix is disabled
        if(disabledDefaults !== null && (content.toLowerCase().startsWith(`<@!${client.user.id}> ${alias}`)) && disabledDefaults.includes('mention-prefix')) return
        // command is now ran
        // spit arguments
        const arguments = content.split(/[ ]+/)
        // shift it again if it's a mention
        if(
          content.toLowerCase().startsWith(`<@!${client.user.id}> ${alias}`)
        ) arguments.shift()

        // shift the commands to get rid of command
        arguments.shift()
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

        

        // check for args length
        if (
          arguments.length < minArgs ||
          (maxArgs !== null && arguments.length > maxArgs) &&
          maxArgs !== -1
        ) {
          message.reply(
            `Incorrect syntax! Use ${prefix}${alias} ${expectedArgs}`
          )
          return
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
            message: message,
            args: arguments,
            text: arguments.join(' '),
            client: client,
            prefix: prefixes.get(message.guild.id),
          }
          
          // handle the user's command
          try{
            callback(infoObj)
          } catch(e) {
            const errorObj = {
              message: message,
              args: arguments,
              text: arguments.join(' '),
              client: client,
              error: e,
              command: {
                _aliases: aliases,
                _name: aliases[0],
              },
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