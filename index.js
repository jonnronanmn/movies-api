const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 


require('dotenv').config();

const app = express()

// Simple dev-friendly CORS setup
const corsOptions = {
    origin: "*",               
    credentials: true,         
    optionsSuccessStatus: 200  
};
app.use(cors(corsOptions));


app.use(express.json());


const userRoutes = require('./routes/userRoutes');
const moviesRoutes = require('./routes/moviesRoutes');


// MongoDB connection
mongoose.connect(process.env.MONGODB_STRING);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once('open', () => console.log('Now connected to MongoDB Atlas.'));

app.use("/users", userRoutes);
app.use("/movies", moviesRoutes);



if (require.main === module) {
    app.listen(process.env.PORT || 3000, () => console.log(`Server running at port ${process.env.PORT || 3000}`));
}

module.exports = { app, mongoose };