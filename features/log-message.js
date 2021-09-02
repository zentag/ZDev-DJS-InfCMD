module.exports = {
    callback: ({ client }) => {
        client.on('message', message => {
            if(!message.content) return console.log("No content or no message intent")
            console.log(message.content)
        })
    }
}