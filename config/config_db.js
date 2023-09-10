const mongoose = require('mongoose');

// MongoDB URI (replace 'your-username' and 'your-password' with your MongoDB credentials)
const mongoURI = 'mongodb+srv://tushargupta24042002:Tushar2002@cluster0.emvzful.mongodb.net/?retryWrites=true&w=majority';

// MongoDB options (optional)
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Add more options as needed
};

// Connect to MongoDB
mongoose.connect(mongoURI, mongoOptions);

// Create a reference to the connection
const db = mongoose.connection;

// Handle MongoDB connection errors
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = mongoose;
