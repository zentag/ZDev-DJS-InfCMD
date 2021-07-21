module.exports = {
    init: (client, clientOptions) => {
        // Variables
        let { 
            commandsDir,
            featuresDir,
        } = clientOptions
        const path = require('path')
        const fs = require('fs')
        const commandBaseFile = 'command-base.js'
        const commandBase = require(`./${commandBaseFile}`)
        const featureBaseFile = 'feature-base.js'
        const featureBase = require(`./${featureBaseFile}`)
        // Read commands
        const readCommands = (dir) => {
            const __infcmdnewdirname = __dirname.replace("\handler", "")
            if(!(fs.existsSync(path.join(__infcmdnewdirname, commandsDir)))) return console.log("InfCMD > No commands directory")
            const files = fs.readdirSync(path.join(__infcmdnewdirname, commandsDir))
            for (const file of files) {
                const stat = fs.lstatSync(path.join(__infcmdnewdirname, commandsDir, file))
                if (stat.isDirectory()) {
                    readCommands(path.join(commandsDir, file))
                } else if (file !== commandBaseFile) {
                    const option = require(path.join(__infcmdnewdirname, commandsDir, file))
                    commandBase(client, option, file, clientOptions)
                }
            }
        }
        const readFeatures = (dir) => {
            const __infcmdnewdirname = __dirname.replace("\handler", "")
            if(!(fs.existsSync(path.join(__infcmdnewdirname, featuresDir)))) return console.log("InfCMD > No features directory")
            const files = fs.readdirSync(path.join(__infcmdnewdirname, featuresDir))
            for (const file of files) {
                const stat = fs.lstatSync(path.join(__infcmdnewdirname, featuresDir, file))
                if (stat.isDirectory()) {
                    readFeatures(path.join(featuresDir, file))
                } else if (file !== featureBaseFile) {
                    const option = require(path.join(__infcmdnewdirname, featuresDir, file))
                    featureBase(client, option, file)
                }
            }
        }
        readCommands(commandsDir)
        readFeatures(featuresDir)
    },
}