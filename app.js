const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

const app = express();

// Connect to MongoDB (replace with your MongoDB connection string)
mongoose.connect('mongodb+srv://sabeenaviklar:s83zhjz6aJMBG0Vi@cluster0.qbwy4n5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Feedback = mongoose.model('Feedback', new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
}));

// Set Handlebars as view engine
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Routes

const Handlebars = require('handlebars');

// This helper lets you print JSON in templates for debugging
Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context, null, 2);
});


// GET: Display feedback form
app.get('/submit', (req, res) => {
  res.render('submit', { errors: null, formData: {} });
});

// POST: Handle feedback submission with basic validation
app.post('/submit', 
  // Validation rules
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().withMessage('Message is required'),
  
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Render form again with errors and previously entered data
      return res.render('submit', { 
        errors: errors.array(), 
        formData: req.body 
      });
    }

    const feedback = new Feedback({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
    });

    try {
      await feedback.save();
      res.redirect('/feedbacks');
    } catch (err) {
      res.status(500).send('Server error');
    }
  });

// GET: Display all submitted feedback
// app.get('/feedbacks', async (req, res) => {
//   const allFeedbacks = await Feedback.find().sort({ date: -1 });
//  console.log(allFeedbacks);
//   res.render('feedbacks', { feedbacks: allFeedbacks });
// });

app.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Feedback.find().sort({ _id: -1 }).lean();
    res.render('testimonials', { testimonials }); // KEY: 'testimonials' passed
  } catch (err) {
    res.render('testimonials', { testimonials: [], error: 'Could not load testimonials.' });
  }
});


// Server listen
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
