//THIS IS THE BACKEND SERVER
const express = require('express');
const app = express();
const mongoose = require('mongoose');

const morgan = require("morgan");
const path = require('path'); // This is required to resolve the file path

require("dotenv").config();

const cors = require("cors");
const Person = require("./models/person");

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
app.use(express.static('build')); // Serve static files from the build folder

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });


app.use(cors())
app.use(express.json())
app.use(morgan("tiny"))

// Defining a custom token for morgan to log the request body for POST requests
morgan.token("req-body", (req) => { 
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ""
})

//Middleware for logging with custom format
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :req-body"))

// Getting all persons entries
app.get("/api/persons", (req, res, next) => {
  Person.find({}).then((persons) => {
    if (persons) {
    res.json(persons);
    } else {
      res.status(404).end();
    }
    })
    .catch((error) => next(error));
  });

  //Creating a new person entry
app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  if (body.name === undefined) {
    return response.status(400).json({ error: "name missing" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

    person.save().then((savedPerson) => {
      res.json(savedPerson);
    })
    .catch((error) => next(error));
});

//Deleting a single person
app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id).then((result) => {
    res.status(204).end();
  })
  .catch((error) => next(error));
});

//Updating a single persons entry
app.put("/api/persons/:id", (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate( 
    req.params.id, 
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
  .then((updatedPerson) => {
    if (updatedPerson) {
      res.json(updatedPerson);
    } else {
      res.status(404).end();
    }
  })
  .catch((error) => next(error));
});


app.get("/api/persons/:id", (req, res, next) => {
  const { id } = req.params;

  Person.findById(id).then((person) => {
    if (person) {
      res.json(person);
    } else {
      res.status(404).end();
    }
  })
  .catch((error) => next(error));
});

app.get("/info", (req, res, next) => {
  Person.find().then(personEntry => {
    res.send(`Phonebook has info for ${personEntry.length} people.\n ${Date()}`);
  })
  .catch((error) => next(error));
});

// Wildcard route to serve the frontend (React) for any other requests
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } 

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});