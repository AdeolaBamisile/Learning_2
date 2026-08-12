import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";
import { EDIT_PERSON, FIND_PERSON } from "../queries";

const NumberForm = ({ name, setError }) => {
  const [phone, setPhone] = useState("");

  const [editPerson] = useMutation(EDIT_PERSON, {
    refetchQueries: [{ query: FIND_PERSON, variables: { name } }],
  });

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      await editPerson({ variables: { name, phone } });
    } catch (error) {
      setError(error.message);
      setTimeout(() => {
        setError(null);
      }, 5000);
    }

    setPhone("");
  };

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 25 }}>
      <div>
        <label>
          Phone:
          <input
            type="text"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>
      </div>
      <button>Change Number</button>
    </form>
  );
};

export default NumberForm;
