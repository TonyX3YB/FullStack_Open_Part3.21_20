import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Names } from "./components/Names";
import nameService from "./service/name";

const Filter = ({ searchPerson, handleSearchPerson }) => {
  return (
    <div>
      filter shown with: <input value={searchPerson} onChange={handleSearchPerson} />
    </div>
  );
};

const PersonForm = ({ addName, newName, handleNameChange, newNumber, handleNumberChange }) => {
  return (
    <div>
      <form onSubmit={addName}>
        <div>
          name: <input value={newName} onChange={handleNameChange} />
        </div>
        <div>
          number: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
    </div>
  );
};

const Persons = ({ filteredPerson, deleteName }) => {
  console.log(filteredPerson); // Add this line to debug
  return (
    <div>
      {filteredPerson.map((person) => (
        <Names key={person.id} person={person} deleteName={deleteName} />
      ))}
    </div> 
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [searchPerson, setSearchPerson] = useState("");
  const [filteredPerson, setFilteredPerson] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);


  const hook = () => {
    console.log("effect");
    nameService.getAll()
      .then((initialPerson) => {
        console.log("promise fulfilled!");
        setPersons(initialPerson);
        setFilteredPerson(initialPerson);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  };
  useEffect(hook, []);
  console.log("render", persons.length, "persons");

  const addName = (event) => {
    event.preventDefault();
    console.log(event.target);

    const nameExists = persons.find((person) => person.name.toLowerCase() === newName.toLowerCase());

    const nameObject = {
      // id: persons.length + 1,
      name: newName,
      number: newNumber,
    };

    if (nameExists) {
      const confirmed = window.confirm(`${nameExists.name} is already added to phonebook, replace the old number with a new one?`);
      
      if (!confirmed) {
        // If user doesn't confirm the entry to be updated, do nothing
        nameService.update(nameExists.id, nameObject)
        .then((updatedPerson) => {
          setPersons(persons.map(person => person.id !== nameExists.id ? person : updatedPerson));
        })
        .catch((error) => {
          console.error(error.response.data.error);
          setErrorMessage(error.response.data.error); // Set the error message to be displayed
        });
        return;
      }
    
      // Update logic
      nameService.update(nameExists.id, nameObject)
        .then((updatedPerson) => {
          setPersons((prevPersons) =>
            prevPersons.map((person) =>
              person.id === nameExists.id ? updatedPerson : person
            )
          );
          setFilteredPerson((prevFilteredPersons) =>
            prevFilteredPersons.map((person) =>
              person.id === nameExists.id ? updatedPerson : person
            )
          );
        })
        .catch((error) => {
          console.error("Error updating the number, a name & phone # are required. Name must be more than 3 characters long.: ", error.message);
          alert("Error updating the number, a name & phone # are required. Name must be more than 3 characters long.");
        });
    } else {
      nameService
        .create(nameObject)
        .then((returnedPerson) => {
          console.log(returnedPerson);
          setPersons(persons.concat(returnedPerson));
          setFilteredPerson(filteredPerson.concat(returnedPerson));
        })
        // .catch((error) => {
        //   console.error("Error updating the number, a name & phone # are required. Name must be more than 3 characters long.: ", error.message);
        //   alert("Error updating, a name & phone # are required. Name must be more than 3 characters long & phone #s must be 09-1234556 and 040-22334455 valid.");
        // })
        .catch((error) => {
          setErrorMessage(`Error: ${error.response.data.error}`);
          setTimeout(() => setErrorMessage(null), 5000);  // Clear after 5 seconds
        });
        
    }    

    setNewName("");
    setNewNumber("");
  };

  const deleteName = (id, name) => {
    const confirmDelete = window.confirm(`Delete ${name} ?`);
    if (!confirmDelete) {
      return;
    }

    nameService.remove(id)
      .then(() => {
        setPersons(persons.filter((person) => person.id !== id));
        setFilteredPerson(filteredPerson.filter((person) => person.id !== id));
      })
      .catch((error) => {
        console.log("Error deleting person: ", error.message);
        alert("Error deleting person");
      });
  };

  const handleNameChange = (event) => {
    console.log(event.target.value);
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    console.log(event.target.value);
    setNewNumber(event.target.value);
  };

  const handleSearchPerson = (event) => {
    console.log(event.target.value);
    setSearchPerson(event.target.value);

    const filterItems = persons.filter((person) =>
      person.name.toLowerCase().includes(event.target.value.toLowerCase())
    );
    setFilteredPerson(filterItems);
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Filter searchPerson={searchPerson} handleSearchPerson={handleSearchPerson} />
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>} {/* Display error message */}
      <h3>Add a new</h3>
      <PersonForm
        addName={addName}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange} 
      />
      <h3>Numbers</h3>
      <Persons filteredPerson={filteredPerson} deleteName={deleteName} />
    </div>
  );
};

export default App;
