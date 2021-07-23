const Discord = require('discord.js')
const { readCommands } = require('../infcmd.js')

module.exports = {
    minArgs: 0,
    maxArgs: 1,
    identifier: 3,
    expectedArgs: "[command]",
    callback: ({ message, prefix, args }) => {
        const embed = new Discord.MessageEmbed()

        const commands = readCommands()
        let counter = 0
        let page = 0
        for (const command of commands) {
            // desctructure stuff
            let { permissions, description, expectedArgs, aliases } = command
            // check for permissions
            if (permissions) {
                let hasPermission = true
                if (typeof permissions === 'string') {
                permissions = [permissions]
                }

                for (const permission of permissions) {
                if (!message.member.hasPermission(permission)) {
                    hasPermission = false
                    break
                }
                }

                if (!hasPermission) {
                continue
                }
            }

            // format embed fields
            const mainCommand = command.aliases[0]
            let cmddescription = "This command has no description"
            if(counter % 5 == 0) page++
            counter++
            // bunch of page logic -- skip to line 134
            if((!args[0] || args[0] == 1) && page == 1){
                if(description) cmddescription = `Description: ${description}`
                const save = aliases[0]
                aliases.shift()
                if(aliases.length > 0) cmddescription += `\nAliases: ${aliases.join(", ")}`
                aliases.unshift(save)
                if(expectedArgs) cmddescription += `\nCommand with arguments: **${prefix}${mainCommand} ${expectedArgs}**`
                embed.addField(`**${prefix}${mainCommand}**`, cmddescription)
            }
            else if((!args[0] || args[0] == 2) && page == 2){
                if(description) cmddescription = `Description: ${description}`
                const save = aliases[0]
                aliases.shift()
                if(aliases.length > 0) cmddescription += `\nAliases: ${aliases.join(", ")}`
                aliases.unshift(save)
                if(expectedArgs) cmddescription += `\nCommand with arguments: **${prefix}${mainCommand} ${expectedArgs}**`
                embed.addField(`**${prefix}${mainCommand}**`, cmddescription)
            }
            else if((!args[0] || args[0] == 3) && page == 3){
                if(description) cmddescription = `Description: ${description}`
                const save = aliases[0]
                aliases.shift()
                if(aliases.length > 0) cmddescription += `\nAliases: ${aliases.join(", ")}`
                aliases.unshift(save)
                if(expectedArgs) cmddescription += `\nCommand with arguments: **${prefix}${mainCommand} ${expectedArgs}**`
                embed.addField(`**${prefix}${mainCommand}**`, cmddescription)
            }
            else if((!args[0] || args[0] == 4) && page == 4){
                if(description) cmddescription = `Description: ${description}`
                const save = aliases[0]
                aliases.shift()
                if(aliases.length > 0) cmddescription += `\nAliases: ${aliases.join(", ")}`
                aliases.unshift(save)
                if(expectedArgs) cmddescription += `\nCommand with arguments: **${prefix}${mainCommand} ${expectedArgs}**`
                embed.addField(`**${prefix}${mainCommand}**`, cmddescription)
            }
            else if((!args[0] || args[0] == 5) && page == 5){
                if(description) cmddescription = `Description: ${description}`
                const save = aliases[0]
                aliases.shift()
                if(aliases.length > 0) cmddescription += `\nAliases: ${aliases.join(", ")}`
                aliases.unshift(save)
                if(expectedArgs) cmddescription += `\nCommand with arguments: **${prefix}${mainCommand} ${expectedArgs}**`
                embed.addField(`**${prefix}${mainCommand}**`, cmddescription)
            }
            else if((!args[0] || args[0] == 6) && page == 6){
                if(description) cmddescription = `Description: ${description}`
                const save = aliases[0]
                aliases.shift()
                if(aliases.length > 0) cmddescription += `\nAliases: ${aliases.join(", ")}`
                aliases.unshift(save)
                if(expectedArgs) cmddescription += `\nCommand with arguments: **${prefix}${mainCommand} ${expectedArgs}**`
                embed.addField(`**${prefix}${mainCommand}**`, cmddescription)
            }
            else if((!args[0] || args[0] == 7) && page == 7){
                if(description) cmddescription = `Description: ${description}`
                const save = aliases[0]
                aliases.shift()
                if(aliases.length > 0) cmddescription += `\nAliases: ${aliases.join(", ")}`
                aliases.unshift(save)
                if(expectedArgs) cmddescription += `\nCommand with arguments: **${prefix}${mainCommand} ${expectedArgs}**`
                embed.addField(`**${prefix}${mainCommand}**`, cmddescription)
            }
            else if((!args[0] || args[0] == 8) && page == 8){
                if(description) cmddescription = `Description: ${description}`
                const save = aliases[0]
                aliases.shift()
                if(aliases.length > 0) cmddescription += `\nAliases: ${aliases.join(", ")}`
                aliases.unshift(save)
                if(expectedArgs) cmddescription += `\nCommand with arguments: **${prefix}${mainCommand} ${expectedArgs}**`
                embed.addField(`**${prefix}${mainCommand}**`, cmddescription)
            }
            else if((!args[0] || args[0] == 9) && page == 9){
                if(description) cmddescription = `Description: ${description}`
                const save = aliases[0]
                aliases.shift()
                if(aliases.length > 0) cmddescription += `\nAliases: ${aliases.join(", ")}`
                aliases.unshift(save)
                if(expectedArgs) cmddescription += `\nCommand with arguments: **${prefix}${mainCommand} ${expectedArgs}**`
                embed.addField(`**${prefix}${mainCommand}**`, cmddescription)
            }
            else if((!args[0] || args[0] == 10) && page == 10){
                if(description) cmddescription = `Description: ${description}`
                const save = aliases[0]
                aliases.shift()
                if(aliases.length > 0) cmddescription += `\nAliases: ${aliases.join(", ")}`
                aliases.unshift(save)
                if(expectedArgs) cmddescription += `\nCommand with arguments: **${prefix}${mainCommand} ${expectedArgs}**`
                embed.addField(`**${prefix}${mainCommand}**`, cmddescription)
            }
        }
        // check if page exists
        if(args[0] && (args[0] > page || args[0] < 1)) return message.reply("Invalid page number!")
        // set footer
        if(!args[0]) embed.setFooter(`Page 1/${page} | ${prefix}help <page>`)
        if(args[0]) embed.setFooter(`Page ${args[0]}/${page} | ${prefix}help <page>`)
        // set title and description
        embed.setTitle(`Help Menu`)
        embed.setDescription("Find commands, aliases, and arguments here")
        // send
        message.channel.send(embed)
    }
}