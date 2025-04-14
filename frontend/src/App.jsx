import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import "./styles.css";

function App() {
  return (
    <div className="container">
      <h1>Login / Auth Page</h1>
      <div className="cards">
        <RegisterForm />
        <LoginForm />
      </div>
    </div>
  );
}

export default App;
