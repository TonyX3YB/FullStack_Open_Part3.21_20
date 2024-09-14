//This is the backend and I can only see this in the terminal.
const mongoose = require('mongoose')
require('dotenv').config()

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)

  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

// Custom validator for phone numbers
const phoneValidator = [
  {
    validator: function (v) {
      return /^\d{2,3}-\d+$/.test(v) // Regular expression to check format
    },
    message: (props) => `${props.value} is not a valid phone number! Use the format: 09-1234556 or 040-22334455.`
  },
  {
    validator: function (v) {
      return v.replace('-', '').length >= 8 // Ensuring total length of at least 8 digits
    },
    message: (props) => `${props.value} must be at least 8 digits long.`
  }
]

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Name must be at least 3 characters long.'], // Custom error message
    required: [true, 'Name is required.']
  },
  number: {
    type: String,
    required: [true, 'Phone number is required.'],
    validate: phoneValidator // Attach custom validator here
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Person', personSchema)
