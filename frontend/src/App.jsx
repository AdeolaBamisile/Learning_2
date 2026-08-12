import {
  useApolloClient,
  useQuery,
  useSubscription,
} from "@apollo/client/react";
import Persons from "./Components/Persons";
import { ALL_PERSONS, ME, PERSON_ADDED, PERSON_COUNT } from "./queries";
import Notify from "./Components/Notify";
import { useState } from "react";
import LoginForm from "./Components/LoginForm";
import { addPersonToCache } from "./utils/apolloCache";

const App = () => {
  const [error, setError] = useState(null);
  const [token, setToken] = useState(window.localStorage.getItem("loginToken"));

  const result = useQuery(ALL_PERSONS);
  const noPersons = useQuery(PERSON_COUNT);

  const loggedIn = useQuery(ME, {
    skip: !token,
  });

  const client = useApolloClient();

  useSubscription(PERSON_ADDED, {
    onData: ({ data }) => {
      const addedPerson = data.data.personAdded;
      setError(`New person '${addedPerson.name}' added`);
      setTimeout(() => {
        setError(null);
      }, 5000);
      addPersonToCache(client.cache, addedPerson);
    },
  });

  const handleLogout = () => {
    setToken(null);
    window.localStorage.clear();
    client.resetStore();
  };

  if (result.loading || noPersons.loading || loggedIn.loading) {
    return <div>Loading...</div>;
  }

  if (result.error) {
    return <div>Unable to fetch persons</div>;
  }

  return (
    <>
      <h1>Persons</h1>
      <Notify errorMessage={error} />
      {!token && (
        <>
          <h2>Login</h2>
          <LoginForm setError={setError} setToken={setToken} />
        </>
      )}
      {token && (
        <>
          <Persons
            persons={result.data.allPersons}
            setError={setError}
            ALL_PERSONS={ALL_PERSONS}
          />
          <div>There are {noPersons.data.personCount} persons </div>
          <button onClick={handleLogout}>logout</button>
          <div>Logged in as {loggedIn.data.me.username}</div>
        </>
      )}
    </>
  );
};

export default App;
