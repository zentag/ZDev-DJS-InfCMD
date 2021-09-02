module.exports = (client, callback, file) => {
    const name = file.replace('.js', '')
    if(typeof callback !== "function") return console.log(`InfCMD WARNING > Feature "${name}" doesn't have a valid function`)
    // log that the feature is loaded
    console.log(`InfCMD > Loaded Feature: "${name}"`);
    // run the feature
    callback(client);
}