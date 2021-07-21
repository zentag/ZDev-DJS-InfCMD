module.exports = {
    aliases: ['addition'],
    expectedArgs: '<num1> <num2>',
    permissionError: 'You need admin permissions to run this command',
    minArgs: 2,
    maxArgs: 2,
    testOnly: true,
    ownerOnly: true,
    callback: ({ message, args }) => {
      const num1 = +args[0]
      const num2 = +args[1]
      let nummy = "funny".stonks()
      message.reply(`The sum is ${num1 + num2}`)
    },
    error: ({ message, error, client, errortype }) => {
      const me = client.users.cache.get('521115847801044993')
      me.send("There was an error with the bot!")
      if(errortype == "EXCEPTION"){
        message.reply("An error has occured, and it has been reported to the developers")
      } 
      console.log(error)
    },
    permissions: 'ADMINISTRATOR',
    requiredRoles: ["Funny"],
  }