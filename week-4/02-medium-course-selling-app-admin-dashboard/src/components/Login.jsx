import React, { useState } from "react";
import toast from "react-hot-toast";
import { postData } from "../utils/httpUtils";
import { useNavigate } from "react-router-dom";
/// File is incomplete. You need to add input boxes to take input for users to login.
function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = useState("");

  let navigate = useNavigate();

  const onSubmit = async () => {
    if (password.length > 0 && email.length > 0) {
      try {
        const res = await postData("/admin/login", {
          email,
          password,
        });
        localStorage.setItem("USER_TOKEN", `Bearer ${res.token}`);
        toast.success("Logged In successfully");
        navigate("/courses");
        return res;
      } catch (err) {
        toast.error("Account does not exists");
      }
    } else {
      toast.error("Enter Correct Data");
    }
  };

  return (
    <div>
      <h1>Login to admin dashboard</h1>
      <br />
      Email - <input type={"text"} onChange={(e) => setEmail(e.target.value)} />
      Password -{" "}
      <input type={"text"} onChange={(e) => setPassword(e.target.value)} />
      <br />
      <button type={"text"} onClick={onSubmit}>
        Login
      </button>
      <br />
      New here? <a href="/register">Register</a>
    </div>
  );
}

export default Login;
