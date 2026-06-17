import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(username.trim(), password);
      console.log("Login response:", result);
      console.log("force_password_change value:", result.user?.force_password_change);
      console.log("Type:", typeof result.user?.force_password_change);

      if (result.success) {
        // Small delay to allow React state to update
        await new Promise((resolve) => setTimeout(resolve, 50));

        if (result.user?.force_password_change) {
          console.log("Navigating to /change-password");
          navigate("/change-password", { replace: true });
          return;
        }
        console.log("Navigating to dashboard");
        navigate(redirectTo, { replace: true });
        return;
      }

      setError(result.message || "Nom d'utilisateur ou mot de passe incorrect.");
    } catch {
      setError("Nom d'utilisateur ou mot de passe incorrect.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-logo-wrap">
          <img className="login-logo" src="/avocarbon-logo.png" alt="Logo de l'entreprise" />
        </div>

        <div className="login-title-block">
          <p className="login-kicker">Espace qualité</p>
          <h1 id="login-title">Connectez-vous à votre compte</h1>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Nom d'utilisateur
            <input
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label>
            Mot de passe
            <span className="password-field">
              <input
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </span>
          </label>

          <button className="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>

          {error && <p className="login-error">❌ {error}</p>}
        </form>
      </section>
    </main>
  );
}
