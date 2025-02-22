import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [usernameReg, setUsernameReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [usernameLog, setUsernameLog] = useState("");
  const [passwordLog, setPasswordLog] = useState("");

  const [message, setMessage] = useState("");

  const register = async () => {
    try {
      const res = await axios.post("/api/v1/users/signup", {
        username: usernameReg,
        password: passwordReg,
      });

      if (res.data.status === "success") {
        setMessage(" Registration successful! You can now log in.");
        setUsernameReg("");
        setPasswordReg("");
      }
    } catch (err) {
      setMessage(` Registration failed: ${err.response?.data?.message || "Something went wrong"}`);
    }
  };

  const login = async () => {
    try {
      const res = await axios.post("/api/v1/users/login", {
        username: usernameLog,
        password: passwordLog,
      });
  
      if (res.data.status === "success") {
        const username = res.data.data.user.username; 
        setMessage(` Login successful! Welcome back, ${username}.`);
        setUsernameLog("");
        setPasswordLog("");
      }
    } catch (err) {
      setMessage(` Login failed: ${err.response?.data?.message || "Invalid credentials"}`);
    }
  };
  

  return (
    <div className="App">
      <div className="registration">
        <h1>Registration</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <label>Username</label>
          <input
            type="text"
            onChange={(e) => setUsernameReg(e.target.value)}
            value={usernameReg}
          />
          <label>Password</label>
          <input
            type="password"
            onChange={(e) => setPasswordReg(e.target.value)}
            value={passwordReg}
          />
          <button onClick={register}>Register</button>
        </form>
      </div>

      <div className="login">
        <h1>Login</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Username..."
            onChange={(e) => setUsernameLog(e.target.value)}
            value={usernameLog}
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="Password..."
            onChange={(e) => setPasswordLog(e.target.value)}
            value={passwordLog}
          />
          <button onClick={login}>Log in</button>
        </form>
      </div>

      <h1>{message}</h1>
    </div>
  );
}

export default App;
