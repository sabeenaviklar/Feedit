const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');

router.get('/', (req, res) => {
    res.render('index');
});

router.post('/submit', 
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('message').notEmpty().withMessage('Message is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('index', { errors: errors.array(), formData: req.body });
        }

        const { name, message } = req.body;
        const feedback = new Feedback({ name, message });
        await feedback.save();
        res.redirect('/testimonials');
    }
);

router.get('/testimonials', async (req, res) => {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.render('testimonials', { feedbacks });
});

module.exports = router;
