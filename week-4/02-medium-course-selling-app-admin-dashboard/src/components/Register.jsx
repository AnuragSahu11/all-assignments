import React, { useState } from "react";
import { postData } from "../utils/httpUtils";
import toast from "react-hot-toast";

/// File is incomplete. You need to add input boxes to take input for users to register.
function Register() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    if (password.length > 0 && email.length > 0) {
      try {
        const res = await postData("/admin/signup", {
          email,
          password,
        });
        localStorage.setItem("USER_TOKEN", `Bearer ${res.token}`);
        toast.success("Account created successfully");
        return res;
      } catch (err) {
        toast.error("Account already exists");
      }
    } else {
      toast.error("Enter Correct Data");
    }
  };

  return (
    <div>
      <h1>Register to the website</h1>
      <br />
      <input type={"text"} onChange={(e) => setEmail(e.target.value)} />
      <input type={"text"} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={onSubmit}>Create an Account</button>
      <br />
      Already a user? <a href="/login">Login</a>
    </div>
  );
}

export default Register;
