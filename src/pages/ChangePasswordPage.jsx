import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ChangePasswordPage() {
  const { currentUser, changePassword } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await changePassword(currentUser.username, newPassword);
      if (result.success) {
        navigate("/", { replace: true });
        return;
      }

      setError(result.message || "Erreur lors du changement de mot de passe");
    } catch {
      setError("Erreur lors du changement de mot de passe");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="change-password-title">
        <div className="login-title-block">
          <p id="change-password-title" className="login-kicker">
            Changement de mot de passe requis
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Nouveau mot de passe
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength="6"
            />
          </label>

          <label>
            Confirmer le mot de passe
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength="6"
            />
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>

          {error && <p className="login-error">{error}</p>}
        </form>
      </section>
    </main>
  );
}
