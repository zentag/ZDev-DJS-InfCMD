const mongo = require('../mongo.js')
const settingsSchema = require('../schemas/settings.js')

module.exports = {
    permissions: ['ADMINISTRATOR'],
    identifier: 1,
    name: "disable_command",
    description: "Disables a command on this server",
    options: [
        {
            name: "command",
            description: "The command to disable",
            type: "STRING",
            required: true
        }
    ],
    callback: async ({ interaction, mongoURI, userCommands, prefix }) => {
        // set guildid for mongo ease of use
        const guildId = interaction.guild.id
        if(interaction.options.getString('command')) {
            // check if it's a real command
            if(userCommands.includes(interaction.options.getString('command'))) {
                await mongo(mongoURI).then(async (mongoose) => {
                    try {
                    // update the db
                    const result = await settingsSchema.findOneAndUpdate(
                        {
                        guildId
                        },
                        {
                        guildId,
                        $addToSet: {
                            disabledCommands: interaction.options.getString('command')
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
                interaction.reply(`Command ${interaction.options.getString('command')} has been disabled on this server. To enable it, use ${prefix}enable-command <command>`)
            } else {
                // not a real command
                interaction.reply("Invalid command!")
            }
        } else {
            // no args[0], no command specified
            interaction.reply("Looks like you didn't specify a command to disable! Please add a command to disable.")
        }
    }
}