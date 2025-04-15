"use client"

import { useState } from "react"
import Alert from "./Alert"

function RegisterForm() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prevForm) => ({ ...prevForm, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error("Користувач уже існує або сталася помилка")
      }

      const data = await response.json()

      // Show success message
      setAlert({
        show: true,
        message: `Успішно зареєстровано: ${data.email}`,
        type: "success",
      })
    } catch (error) {
      console.error(error)
      setAlert({
        show: true,
        message: "Користувач уже існує або сталася помилка",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="register-email" className="form-label">
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          className="form-input"
          placeholder="name@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-password" className="form-label">
          Пароль
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          className="form-input"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>

      {alert.show && <Alert message={alert.message} type={alert.type} />}

      <button type="submit" className="form-button" disabled={isLoading}>
        {isLoading ? "Завантаження..." : "Зареєструватися"}
      </button>
    </form>
  )
}

export default RegisterForm