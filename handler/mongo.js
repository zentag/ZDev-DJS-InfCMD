const mongoose = require('mongoose')

module.exports = async (mongoURI) => {
    await mongoose.connect(mongoURI, { useUnifiedTopology: true, useNewUrlParser: true } )
    return mongoose
}