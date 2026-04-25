import React,{useState} from "react";
import "./Login.css";
const Login = ({onLogin}) => {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
    const handleSubmit = () => {
        if (!username || !phone) {
            alert("Please enter both username and phone number.");
            return;
          }
          onLogin({username, phone});
          localStorage.setItem("user", JSON.stringify({username, phone}));
    };
  return (
  <div className="login-container">
    <div className="login-box">
      <h2>Welcome 👋</h2>
      <p>Enter your details to continue</p>

      <input
        type="text"
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="number"
        placeholder="Enter your phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button onClick={handleSubmit}>
        Continue
      </button>
     
      
    </div>
  </div>
);

};
export default Login;
  
