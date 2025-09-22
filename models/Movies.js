const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is Required']
    },
    director: {
        type: String,
        required: [true, 'Director is Required']
    },
    year: {
        type: Number,
        required: [true, 'Year is Required']
    },
    description: {
        type: String,
        required: [true, 'Description is Required']
    },
    genre: {
        type: String,
        required: [true, 'Genre is Required']
    },
    comments: [
        {
            userId: {
                type: String,
                required: [true, 'User ID is Required']
            },
            comment: {
                type: String,
                required: [true, 'Comment is Required']
            }
        }
    ]
});

module.exports = mongoose.model('Movie', movieSchema);