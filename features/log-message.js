module.exports = (client) => {
    client.on('messageCreate', (message) => {
        if(!message.content) return console.log("No content or no message intent")
        console.log(message.content)
    })
}