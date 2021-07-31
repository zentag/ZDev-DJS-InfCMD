module.exports = (client, callback, file) => {
    // log that the feature is loaded
    console.log(`InfCMD > Loaded Feature: "${file.replace('.js', '')}"`);
    // run the feature
    callback(client);
}