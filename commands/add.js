module.exports = {
    aliases: ['addition'],
    options: [{
      name: 'num1',
      type: "STRING",
      description: "One of 2 numbers to add",
      required: true
    },
    {
      name: 'num2',
      type: "STRING",
      description: "One of 2 numbers to add",
      required: true
    },],
    minArgs: 2,
    maxArgs: 2,
    testOnly: true,
    ownerOnly: true,
    permissions: 'ADMINISTRATOR',
    callback: ({ message, args }) => {
      const num1 = +args[0]
      const num2 = +args[1]
      message.reply(`The sum is ${num1 + num2}`)
    },
    error: ({ message, error, errortype, rr,  }) => {
      if(errortype == "EXCEPTION") message.reply("An error has occured, and it has been reported to the developers")
      else if(errortype == "ROLE") message.reply(`You must have the role "${rr}" to run this command`)
      else if(errortype == "PERMISSION") message.reply(`You must have the permission "${permission}" to run this command`)
      if(errortype == "EXCEPTION") console.log(error)
    },
}