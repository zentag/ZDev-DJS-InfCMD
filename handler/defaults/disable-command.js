const mongo = require('../mongo.js')
const settingsSchema = require('../schemas/settings.js')

module.exports = {
    minArgs: 1,
    maxArgs: 1,
    permissions: ['ADMINISTRATOR'],
    identifier: 1,
    callback: async ({ message, mongoURI, args, userCommands, prefix }) => {
        const guildId = message.guild.id
        if(args[0]) {
            if(userCommands.includes(args[0])) {
                await mongo(mongoURI).then(async (mongoose) => {
                    try {
                    const result = await settingsSchema.findOneAndUpdate(
                        {
                        guildId
                        },
                        {
                        guildId,
                        $addToSet: {
                            disabledCommands: args[0]
                        }
                        },
                        {
                        upsert: true,
                        new: true,
                        }
                    )
                    } finally {
                    console.log("hell ya, mongo succeed")
                    }
                })
                message.reply(`Command ${args[0]} has been disabled on this server. To enable it, use ${prefix}enable-command <command>`)
            } else {
                message.reply("Invalid command!")
            }
        } else {
            message.reply("Looks like you didn't specify a command to disable! Please add a command to disable.")
        }
    }
}