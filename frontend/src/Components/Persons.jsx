import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import Person from "./Person";
import PersonForm from "./PersonForm";
import { FIND_PERSON } from "../queries";

const Persons = ({ persons, ALL_PERSONS, setError }) => {
  const [name, setName] = useState(null);

  const result = useQuery(FIND_PERSON, {
    variables: { name },
    skip: !name,
  });

  if (name && result.data) {
    return (
      <Person
        setError={setError}
        person={result.data.findPerson}
        onClose={() => setName(null)}
      />
    );
  }

  return (
    <>
      <ul>
        {persons.map((p) => (
          <li key={p.id}>
            {p.name} {p.phone}
            <button onClick={() => setName(p.name)}>show full info</button>
          </li>
        ))}
      </ul>
      <PersonForm setError={setError} />
    </>
  );
};

export default Persons;
