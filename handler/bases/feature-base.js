module.exports = (client, commandOptions, file) => {
    const clientObj = { client: client }
    // destructure callback from the feature
    let { callback } = commandOptions
    // log that the feature is loaded
    console.log(`InfCMD > Loaded Feature: "${file.replace('.js', '')}"`)
    // run the feature
    callback(clientObj)
}