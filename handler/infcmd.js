module.exports = {
    init: (client, clientOptions) => {
        // set max listeners
        client.setMaxListeners(100)
        // Variables
        let { 
            commandsDir,
            featuresDir,
            disabledDefaults,
        } = clientOptions
        const defaultDir = 'defaults'
        const path = require('path')
        const fs = require('fs')
        const commandBaseFile = 'command-base.js'
        const commandBase = require(`./bases/${commandBaseFile}`)
        const featureBaseFile = 'feature-base.js'
        const featureBase = require(`./bases/${featureBaseFile}`)
        let userCommands = [];
        // read commands
        const readCommands = (dir) => {
            // get dir
            const __infcmdnewdirname = __dirname.replace("\handler", "")
            // check for commands dir
            if(!(fs.existsSync(path.join(__infcmdnewdirname, commandsDir)))) return console.log("InfCMD > No commands directory")
            const files = fs.readdirSync(path.join(__infcmdnewdirname, commandsDir))
            // go through each file
            for (const file of files) {
                const stat = fs.lstatSync(path.join(__infcmdnewdirname, commandsDir, file))
                // if it's a directory, do it again
                if (stat.isDirectory()) {
                    readCommands(path.join(commandsDir, file))
                } else if (file !== commandBaseFile) {
                    // push name to userCommands
                    userCommands.push(file.replace('.js', ''))
                    // get option and send to command base
                    const option = require(path.join(__infcmdnewdirname, commandsDir, file))
                    commandBase(client, option, file, clientOptions)
                }
            }
        }
        const readDefaultCommands = (dir) => {
            if(!(fs.existsSync(path.join(__dirname, defaultDir)))) return console.log("InfCMD > No default commands directory")
            const files = fs.readdirSync(path.join(__dirname, defaultDir))
            for (const file of files) {
                const stat = fs.lstatSync(path.join(__dirname, defaultDir, file))
                if (stat.isDirectory()) {
                    readCommands(path.join(defaultDir, file))
                } else if (file !== commandBaseFile) {
                    let name = file.replace('.js', '')
                    if(disabledDefaults && disabledDefaults.includes(name)) return console.log(`InfCMD > The "${name}" default command disabled due to being disabled`)
                    if(userCommands.includes(name)) return console.log(`InfCMD > The "${name}" default command disabled due to override`)
                    const option = require(path.join(__dirname, defaultDir, file))
                    commandBase(client, option, file, clientOptions, userCommands)
                }
            }
        }
        const readFeatures = (dir) => {
            // get dir
            const __infcmdnewdirname = __dirname.replace("\handler", "")
            // check for commands dir
            if(!(fs.existsSync(path.join(__infcmdnewdirname, featuresDir)))) return console.log("InfCMD > No features directory")
            const files = fs.readdirSync(path.join(__infcmdnewdirname, featuresDir))
            // go through each file
            for (const file of files) {
                const stat = fs.lstatSync(path.join(__infcmdnewdirname, featuresDir, file))
                // if it's a directory, do it again
                if (stat.isDirectory()) {
                    readFeatures(path.join(featuresDir, file))
                } else if (file !== featureBaseFile) {
                    // send to feature base
                    const option = require(path.join(__infcmdnewdirname, featuresDir, file))
                    featureBase(client, option, file)
                }
            }
        }
        // call all functions
        readDefaultCommands(defaultDir)
        readCommands(commandsDir)
        readFeatures(featuresDir)
    },
    // function for getting all commands
    readCommands: () => {
        const commandBaseFile = 'command-base.js'
        const path = require('path')
        const fs = require('fs')
        const commandsDir = 'commands'
        let userCommands = []
        const readCommands = (dir) => {
            const __infcmdnewdirname = __dirname.replace("\handler", "")
            if(!(fs.existsSync(path.join(__infcmdnewdirname, commandsDir)))) return console.log("InfCMD > No commands directory")
            const files = fs.readdirSync(path.join(__infcmdnewdirname, commandsDir))
            for (const file of files) {
                const stat = fs.lstatSync(path.join(__infcmdnewdirname, commandsDir, file))
                if (stat.isDirectory()) {
                    readCommands(path.join(commandsDir, file))
                } else if (file !== commandBaseFile) {
                    let option = require(path.join(__infcmdnewdirname, commandsDir, file))
                    if(option.aliases == undefined) {
                        option.aliases = [file.replace(".js", "")]
                    } else if(option.aliases[0] !== file.replace(".js", "")){
                        option.aliases.push(file.replace(".js", ""))
                    }
                    userCommands.push(option)
                }
            }
        }
        readCommands()
        return userCommands;
        
    }
}