const mongo = require('../mongo.js')
module.exports = {
    minArgs: 0,
    maxArgs: 1,
    identifier: 0,
    permissions: ['ADMINISTRATOR'],
    callback: async ({ message, mongoURI, args, prefix }) => {
        // get schema and guildid
        const settingsSchema = require('../schemas/settings.js')
        const guildId = message.guild.id
        if(args[0]){
            await mongo(mongoURI).then(async (mongoose) => {
                try {
                  // update db
                  const result = await settingsSchema.findOneAndUpdate(
                    {
                      guildId
                    },
                    {
                      guildId,
                      $set: {
                          prefix: args[0]
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
            message.channel.send(`Prefix has been set to ${args[0]}!`)
        } else {
            // if no args, say prefix
            message.channel.send(`This guild's prefix is ${prefix}`);
        }
    }
}