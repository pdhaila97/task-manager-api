const mongoose = require("mongoose");

const dbUrl = process.env.MONGODB_URL;
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true
});
