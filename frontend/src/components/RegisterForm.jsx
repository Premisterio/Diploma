import { useState } from "react";
import Alert from "./Alert";
import { useAuth } from "../context/AuthContext";

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await register(name, email, password);
      
      if (success) {
        setAlert({
          show: true,
          message: "Успішно зареєстровано. Тепер ви можете увійти.",
          type: "success",
        });
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
      } else {
        setAlert({
          show: true,
          message: "Помилка реєстрації. Можливо, такий email вже зареєстровано.",
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
        <label htmlFor="register-name" className="form-label">
          Повне ім'я
        </label>
        <input
          id="register-name"
          type="text"
          className="form-input"
          placeholder="Іван Петренко"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="register-email" className="form-label">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          className="form-input"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="register-password" className="form-label">
          Пароль
        </label>
        <input
          id="register-password"
          type="password"
          className="form-input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {alert.show && <Alert message={alert.message} type={alert.type} />}

      <button type="submit" className="form-button" disabled={isLoading}>
        {isLoading ? "Завантаження..." : "Зареєструватися"}
      </button>
    </form>
  );
}

export default RegisterForm;