import { useState } from "react";
import { LOGIN } from "../queries";
import { useMutation } from "@apollo/client/react";

const LoginForm = ({ setToken, setError }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [Login] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const token = data.login.value;
      setToken(token);
      window.localStorage.setItem("loginToken", token);
    },
    onError: (error) => {
      setError(error.message);
      setTimeout(() => {
        setError(null);
      }, 5000);
    },
  });

  const handleLogin = (event) => {
    event.preventDefault();
    Login({ variables: { username, password } });
  };

  return (
    <form onSubmit={handleLogin}>
      <div>
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Password
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;
