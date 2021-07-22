module.exports = (client, commandOptions, file) => {
    const clientObj = {
        client: client
    }
    let { callback } = commandOptions
    console.log(`InfCMD > Loaded Feature: "${file.replace('.js', '')}"`)
    callback(clientObj)
}