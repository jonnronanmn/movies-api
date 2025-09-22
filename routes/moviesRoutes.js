const express = require('express');
const router = express.Router();
const moviesController = require('../controllers/moviesController');
const { verify, verifyAdmin } = require('../auth');

// Add a movie → Admin only
router.post('/addMovie', verify, verifyAdmin, moviesController.addMovie);

// Get all movies → Authenticated users
router.get('/getMovies', verify, moviesController.getMovies);

// Get movie by ID → Authenticated users
router.get('/getMovie/:movieId', verify, moviesController.getMovieById);

// Update movie → Admin only
router.patch('/updateMovie/:movieId', verify, verifyAdmin, moviesController.updateMovie);

// Delete movie → Admin only
router.delete('/deleteMovie/:movieId', verify, verifyAdmin, moviesController.deleteMovie);

// Add comment → Authenticated users
router.patch('/addComment/:movieId', verify, moviesController.addComment);

// Get comments → Authenticated users
router.get('/getComments/:movieId', verify, moviesController.getComments);

module.exports = router;