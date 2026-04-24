const mongoose = require('mongoose');

const connectMongo = async () => {
  const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://sajal:sajal12345@cluster0.acw0pev.mongodb.net/payperapi?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  if (!uri) {
    throw new Error('MONGODB_URI is required in .env');
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log('Connected to MongoDB');
};

module.exports = connectMongo;
