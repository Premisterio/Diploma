import { useState } from "react";
import axios from "axios";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/login", form);
      const token = res.data.access_token;
      localStorage.setItem("token", token);
      setMessage("Вхід успішний");
      // redirect to dashboard - пізніше
    } catch (err) {
      console.error(err);
      setMessage("Невірні дані");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Вхід</h2>
      <input name="email" type="email" onChange={handleChange} placeholder="Email" required />
      <input name="password" type="password" onChange={handleChange} placeholder="Пароль" required />
      <button type="submit">Увійти</button>
      <p>{message}</p>
    </form>
  );
}
