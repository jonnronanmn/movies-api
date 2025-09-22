const Movies = require('../models/Movies'); 
const { errorHandler } = require('../errorHandler');
const auth = require('../auth'); 

// Add a movie (Admin only)
module.exports.addMovie = (req, res) => {
  const { title, director, year, description, genre } = req.body;

  if (!title || !director || !year || !description || !genre) {
    return res.status(400).send({ message: 'All fields are required' });
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
    .then(movie => {
      // Send all fields at top level including _id and __v
      res.status(201).send(movie);
    })
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
    const movie = await Movies.findById(movieId).populate('comments.userId', 'email isAdmin');
    if (!movie) return res.status(404).send({ message: 'Movie not found' });

    res.status(200).send({ movie });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Update a movie (Admin only)
module.exports.updateMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const updates = req.body;

    const movie = await Movies.findByIdAndUpdate(movieId, updates, { new: true });
    if (!movie) return res.status(404).send({ message: 'Movie not found' });

    res.status(200).send({ message: 'Movie updated successfully', movie });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Delete a movie (Admin only)
module.exports.deleteMovie = async (req, res) => {
  const { movieId } = req.params;

  if (!movieId) {
    return res.status(400).send({ error: 'Movie ID is required' });
  }

  try {
    const deletedMovie = await Movies.findByIdAndDelete(movieId);

    if (!deletedMovie) {
      return res.status(404).send({ error: 'Movie not found or already deleted' });
    }

    return res.status(200).send({ message: 'Movie deleted successfully' });
  } catch (err) {
    console.error('Error in deleting a movie:', err);

    // Handle invalid ObjectId specifically
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      return res.status(400).send({ error: 'Invalid movie ID' });
    }

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
      return res.status(400).send({ message: 'Comment cannot be empty' });
    }

    const movie = await Movies.findById(movieId);
    if (!movie) return res.status(404).send({ message: 'Movie not found' });

    const newComment = { userId, comment: comment.trim(), createdAt: new Date() };
    movie.comments.push(newComment);
    await movie.save();

    // Return the updated movie so frontend can update state directly
    const populatedMovie = await movie.populate('comments.userId', 'email isAdmin');
    res.status(200).send({ message: 'Comment added successfully', movie: populatedMovie });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// Get comments from a movie (Authenticated users)
module.exports.getComments = async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await Movies.findById(movieId).populate('comments.userId', 'email isAdmin');

    if (!movie) return res.status(404).send({ message: 'Movie not found' });

    // Map comments to return only userId as string and comment text
    const comments = movie.comments.map(c => ({
      userId: c.userId._id || c.userId, // populated user or just ID
      comment: c.comment,
      _id: c._id
    }));

    res.status(200).send({ comments });
  } catch (error) {
    errorHandler(error, req, res);
  }
};