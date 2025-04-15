"use client"

import { useState } from "react"
import Alert from "./Alert"

function LoginForm() {
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
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error("Невірні дані")
      }

      const data = await response.json()

      // Store token in localStorage
      localStorage.setItem("token", data.access_token)

      // Show success message
      setAlert({
        show: true,
        message: "Вхід успішний",
        type: "success",
      })

      // TODO: redirect here
      // window.location.href = '/dashboard';
    } catch (error) {
      console.error(error)
      setAlert({
        show: true,
        message: "Невірні дані",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          id="email"
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
        <div className="form-footer">
          <label htmlFor="password" className="form-label">
            Пароль
          </label>
          <a href="#" className="form-link">
            Забули пароль?
          </a>
        </div>
        <input
          id="password"
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
        {isLoading ? "Завантаження..." : "Увійти"}
      </button>
    </form>
  )
}

export default LoginForm
