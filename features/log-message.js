module.exports = {
    callback: ({ client }) => {
        client.on('message', message => {
            console.log(message.content)
        })
    }
}