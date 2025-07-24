const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const { body, validationResult } = require('express-validator');
const path = require('path');

const Feedback = require('./models/Feedback');

const app = express();

// Connect to MongoDB (replace URI with your credentials for Atlas)
mongoose.connect('mongodb+srv://sabeenaviklar:s83zhjz6aJMBG0Vi@cluster0.qbwy4n5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Handlebars view engine (register a JSON helper for debugging)
app.engine('handlebars', exphbs.engine({
  helpers: {
    json: function(context) {
      return JSON.stringify(context, null, 2);
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES

// Show feedback form
app.get('/submit', (req, res) => {
  res.render('submit', { errors: null, formData: {} });
});

// Handle feedback form POST
app.post(
  '/submit',
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().withMessage('Message is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('submit', { errors: errors.array(), formData: req.body });
    }
    try {
      const feedback = new Feedback({
        name: req.body.name,
        email: req.body.email,
        message: req.body.message,
      });
      await feedback.save();
      res.redirect('/testimonials');
    } catch (err) {
      res.status(500).send('Server error');
    }
  }
);

// Display all submitted feedback
app.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Feedback.find().sort({ date: -1 }).lean();
    res.render('testimonials', { testimonials });
  } catch (err) {
    res.render('testimonials', { testimonials: [], error: 'Could not load testimonials.' });
  }
});

// Home - Redirect to testimonials
app.get('/', (req, res) => {
  res.redirect('/testimonials');
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
