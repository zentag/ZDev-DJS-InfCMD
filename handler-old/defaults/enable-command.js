const mongo = require('../mongo.js')
const settingsSchema = require('../schemas/settings.js')

module.exports = {
    minArgs: 1,
    maxArgs: 1,
    permissions: ['ADMINISTRATOR'],
    identifier: 2,
    callback: async ({ message, mongoURI, args, userCommands, prefix }) => {
        // set guildid for mongo ease of use
        const guildId = message.guild.id
        if(args[0]) {
            // check if it's a real command
            if(userCommands.includes(args[0])) {
                await mongo(mongoURI).then(async (mongoose) => {
                    try {
                    // update the db
                    const result = await settingsSchema.findOneAndUpdate(
                        {
                        guildId
                        },
                        {
                        guildId,
                        $pull: {
                            disabledCommands: args[0]
                        }
                        },
                        {
                        upsert: true,
                        new: true,
                        }
                    )
                    } finally {
                        
                    }
                })
                // reply
                message.reply(`Command ${args[0]} has been enabled on this server. To disable it, use ${prefix}disable-command <command>`)
            } else {
                // not a real command
                message.reply("Invalid command!")
            }
        } else {
            // no args[0], no command specified
            message.reply("Looks like you didn't specify a command to enable! Please add a command to disable.")
        }
    }
}