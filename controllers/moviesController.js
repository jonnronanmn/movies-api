const Movies = require('../models/Movies'); 
const { errorHandler } = require('../errorHandler');
const auth = require('../auth'); 
const mongoose = require('mongoose');

// Helper: populate comments
const populateComments = async (movie) => {
  return movie.populate('comments.userId', 'email isAdmin');
};

// Add a movie (Admin only)
module.exports.addMovie = (req, res) => {
  const { title, director, year, description, genre } = req.body;

  if (!title || !director || !year || !description || !genre) {
    return res.status(400).send({ error: 'All fields are required' });
  }

  const newMovie = new Movies({
    title,
    director,
    year,
    description,
    genre,
    comments: []
  });

  newMovie.save()
    .then(movie => res.status(201).send({ message: 'Movie added successfully', movie }))
    .catch(error => errorHandler(error, req, res));
};

// Get all movies (Authenticated users)
module.exports.getMovies = async (req, res) => {
  try {
    const movies = await Movies.find().sort({ createdAt: -1 });
    res.status(200).send({ movies });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Get a single movie by ID (Authenticated users)
module.exports.getMovieById = async (req, res) => {
  try {
    const { movieId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).send({ error: 'Invalid movie ID' });
    }

    const movie = await Movies.findById(movieId);
    if (!movie) return res.status(404).send({ error: 'Movie not found' });

    const populatedMovie = await populateComments(movie);
    res.status(200).send({ movie: populatedMovie });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Update a movie (Admin only)
module.exports.updateMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).send({ error: 'Invalid movie ID' });
    }

    const allowedUpdates = ['title','director','year','description','genre'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedUpdates.includes(key))
    );

    const movie = await Movies.findByIdAndUpdate(movieId, updates, { new: true });
    if (!movie) return res.status(404).send({ error: 'Movie not found' });

    res.status(200).send({ message: 'Movie updated successfully', movie });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Delete a movie (Admin only)
module.exports.deleteMovie = async (req, res) => {
  const { movieId } = req.params;

  if (!movieId) return res.status(400).send({ error: 'Movie ID is required' });
  if (!mongoose.Types.ObjectId.isValid(movieId)) return res.status(400).send({ error: 'Invalid movie ID' });

  try {
    const deletedMovie = await Movies.findByIdAndDelete(movieId);
    if (!deletedMovie) return res.status(404).send({ error: 'Movie not found or already deleted' });

    console.log(`Movie ${movieId} deleted successfully`);
    return res.status(200).send({ message: 'Movie deleted successfully' });
  } catch (err) {
    console.error('Error in deleting a movie:', err);
    return res.status(500).send({ error: 'Internal server error while deleting movie' });
  }
};

// Add a comment to a movie (Authenticated users)
module.exports.addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const { movieId } = req.params;
    const userId = req.user.id; // From verify middleware

    if (!comment || comment.trim() === "") {
      return res.status(400).send({ error: 'Comment cannot be empty' });
    }

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).send({ error: 'Invalid movie ID' });
    }

    const movie = await Movies.findById(movieId);
    if (!movie) return res.status(404).send({ error: 'Movie not found' });

    const newComment = { userId, comment: comment.trim(), createdAt: new Date() };
    movie.comments.push(newComment);
    await movie.save();

    const populatedMovie = await populateComments(movie);
    res.status(200).send({ message: 'Comment added successfully', movie: populatedMovie });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Get comments from a movie (Authenticated users)
module.exports.getComments = async (req, res) => {
  try {
    const { movieId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).send({ error: 'Invalid movie ID' });
    }

    const movie = await Movies.findById(movieId);
    if (!movie) return res.status(404).send({ error: 'Movie not found' });

    const populatedMovie = await populateComments(movie);

    const comments = populatedMovie.comments.map(c => ({
      _id: c._id,
      comment: c.comment,
      createdAt: c.createdAt,
      user: {
        _id: c.userId._id,
        email: c.userId.email,
        isAdmin: c.userId.isAdmin
      }
    }));

    res.status(200).send({ comments });
  } catch (error) {
    errorHandler(error, req, res);
  }
};