"use client"

import { useState } from "react"
import Alert from "./Alert"
import { useAuth } from "../context/AuthContext"

function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })
  const { login } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prevForm) => ({ ...prevForm, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, this would be an actual API call
      // For demo purposes, we'll simulate a successful login
      // const response = await fetch("http://localhost:8000/login", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(form),
      // })

      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate successful login
      const data = {
        access_token: "demo_token_12345",
        user: { email: form.email },
      }

      // Login using AuthContext
      login(data.access_token, data.user)

      setAlert({
        show: true,
        message: "Вхід успішний",
        type: "success",
      })
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
