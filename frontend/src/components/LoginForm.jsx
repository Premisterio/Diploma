import { useState } from "react";
import Alert from "./Alert";
import LoadingSpinner from "./LoadingSpinner";
import { useAuth } from "../context/AuthContext";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const { login, error: authError } = useAuth();

  const validateForm = () => {
    if (!email.trim()) {
      setFormError("Email is required");
      return false;
    }

    if (!password.trim()) {
      setFormError("Password is required");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setAlert({ show: false, message: "", type: "" });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        setAlert({
          show: true,
          message: "Вхід успішний",
          type: "success",
        });
      } else {
        setAlert({
          show: true,
          message: authError || "Невірні дані авторизації",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      setAlert({
        show: true,
        message: "Помилка підключення до сервера",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={`form-input ${formError && !email ? "error" : ""}`}
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (formError) setFormError("");
          }}
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
          type="password"
          className={`form-input ${formError && !password ? "error" : ""}`}
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (formError) setFormError("");
          }}
          required
        />
      </div>

      {formError && <Alert message={formError} type="error" />}
      {alert.show && <Alert message={alert.message} type={alert.type} />}

      <button type="submit" className="form-button" disabled={isLoading}>
        {isLoading ? (
          <span className="button-loading">
            <LoadingSpinner size="small" text={null} /> Завантаження...
          </span>
        ) : (
          "Увійти"
        )}
      </button>
    </form>
  );
}

export default LoginForm;