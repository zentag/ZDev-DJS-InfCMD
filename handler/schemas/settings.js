const mongoose = require('mongoose')

const reqString = {
  type: String,
  required: true,
}

const profileSchema = mongoose.Schema({
  guildId: reqString,
  prefix: {
    type: String,
    default: null,
  },
  disabledCommands: {
    type: Array,
    default: null,
  }
})

module.exports = mongoose.model('InfCMD Settings', profileSchema)