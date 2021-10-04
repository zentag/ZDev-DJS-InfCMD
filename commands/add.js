module.exports = {
    name: "add",
    description: "add two numbers",
    options: [{
      name: 'num1',
      type: "INT",
      description: "One of 2 numbers to add",
      required: true
    },
    {
      name: 'num2',
      type: "INT",
      description: "One of 2 numbers to add",
      required: true
    }],
    permissions: 'ADMINISTRATOR',
    callback: ({ interaction }) => {
      const num1 = +interaction.options.getInteger('num1')
      const num2 = +interaction.options.getInteger('num2')
      interaction.reply(`The sum is ${num1 + num2}`)
    },
    error: ({ message, error, errortype, rr,  }) => {
      if(errortype == "EXCEPTION") message.reply("An error has occured, and it has been reported to the developers")
      else if(errortype == "ROLE") message.reply(`You must have the role "${rr}" to run this command`)
      else if(errortype == "PERMISSION") message.reply(`You must have the permission "${permission}" to run this command`)
      if(errortype == "EXCEPTION") console.log(error)
    },
}