import { useMutation } from "@apollo/client/react";
import { useState } from "react";
import { ALL_PERSONS, CREATE_PERSON, PERSON_COUNT } from "../queries";
import { addPersonToCache } from "../utils/apolloCache";

const PersonForm = ({ setError }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");

  const [createPerson] = useMutation(CREATE_PERSON, {
    onError: (error) => {
      setError(error.message);
      setTimeout(() => {
        setError(null);
      }, 5000);
    },
    update: (cache, response) => {
      const addedPerson = response.data.addPerson;
      addPersonToCache(cache, addedPerson);
      cache.updateQuery({ query: PERSON_COUNT }, ({ personCount }) => {
        return {
          personCount: personCount + 1,
        };
      });
    },
  });

  const submit = async (event) => {
    event.preventDefault();

    await createPerson({
      variables: {
        name,
        phone: phone.length > 0 ? phone : undefined,
        street,
        city,
      },
    });
    setName("");
    setCity("");
    setStreet("");
    setPhone("");
  };

  return (
    <form onSubmit={submit}>
      <div>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={() => setName(event.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Phone:
          <input
            type="text"
            value={phone}
            onChange={() => setPhone(event.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          City:
          <input
            type="text"
            value={city}
            onChange={() => setCity(event.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Street:
          <input
            type="text"
            value={street}
            onChange={() => setStreet(event.target.value)}
          />
        </label>
      </div>
      <button>Add Person</button>
    </form>
  );
};

export default PersonForm;
