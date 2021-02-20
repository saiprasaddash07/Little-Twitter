const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI,
            {
                useUnifiedTopology: true ,
                useCreateIndex: true,
                useNewUrlParser: true,
                useFindAndModify:false,
            }
        );
        console.log(`MongoDB Connected : ${conn.connection.host}`.yellow.underline);
    }catch (e) {
        console.log(`Error : ${e.message}`.red.underline.bold);
        process.exit(1);
    }
};

module.exports = connectDB;