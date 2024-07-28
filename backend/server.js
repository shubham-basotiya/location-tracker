const express = require('express');
const mongoose = require('mongoose');
const bodyParser= require('body-parser');
const cors = require('cors');
require('dotenv').config();


const app = express();

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB Atlas 
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log(err));

const locationSchema = new mongoose.Schema({
    name: String,
    coordinates: [{
        latitude: Number,
        longitude: Number,
        timestamp: Date
    }]
});

const Location = mongoose.model('Location', locationSchema);

app.get('/savedMapPaths', async (req, res) => {
    return res.send(await Location.find().sort({_id: -1}));
})

app.get('/pathCoordinates/:id', async(req, res) => {
    return res.send(await Location.findById(req.params.id));
})

app.post('/start', (req, res) => {
    const newLocation = new Location({ name: req.body.name, coordinates: [] });
    newLocation.save().then(location => res.send(location));
});

app.post('/stop/:id', (req, res) => {
    Location.findByIdAndUpdate(
        req.params.id, 
        { $set: {coordinates: req.body.coordinates } },
        { new: true }
    ).then(location => res.send(location));
});

app.delete('/delete/:id', async (req, res) => {
    Location.findByIdAndDelete(req.params.id, (err, doc) => {
        if (err) {
          res.send(err.message);
        } else {
          res.send(doc);
        }
    });
})

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});