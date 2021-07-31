const mongoose = require('mongoose')

module.exports = async (mongoURI) => {
    if(!mongoURI) return
    // connect mongo with URI
    await mongoose.connect(mongoURI, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false } )
    return mongoose
}