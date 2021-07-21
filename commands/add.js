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
  
      message.reply(`The sum is ${num1 + num2}`)
    },
    permissions: 'ADMINISTRATOR',
    requiredRoles: [],
  }