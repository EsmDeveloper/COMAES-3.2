import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3001`;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMessage("Token inválido ou inexistente.");
      return;
    }

    const validateToken = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/verify-reset-token/${token}`);
        if (response.data?.success && response.data?.valid) {
          setStatus("ready");
          setMessage("Token válido. Defina sua nova senha abaixo.");
        } else {
          setStatus("invalid");
          setMessage(response.data?.error || "Token inválido ou expirado.");
        }
      } catch (error) {
        setStatus("invalid");
        setMessage(error?.response?.data?.error || "Token inválido ou expirado.");
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!password || !confirmPassword) {
      setMessage("Preencha ambos os campos de senha.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      return;
    }

    if (password.length < 8) {
      setMessage("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword: password,
      });

      if (response.data?.success) {
        setStatus("success");
        setMessage(response.data.message || "Senha redefinida com sucesso!");
        setTimeout(() => navigate("/login"), 2200);
      } else {
        setMessage(response.data?.error || "Erro ao redefinir senha.");
      }
    } catch (error) {
      setMessage(error?.response?.data?.error || "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-4 text-center">Redefinir senha</h1>

        {status === "loading" && (
          <div className="text-slate-600 text-center">
            <p>Validando token...</p>
          </div>
        )}

        {status === "invalid" && (
          <div className="space-y-4">
            <p className="text-red-600 text-sm text-center">{message}</p>
            <div className="flex flex-col gap-3">
              <Link
                to="/recuperar-senha"
                className="block text-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                Solicitar novo link
              </Link>
              <Link
                to="/login"
                className="block text-center px-4 py-3 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              >
                Voltar ao login
              </Link>
            </div>
          </div>
        )}

        {(status === "ready" || status === "success") && (
          <div className="space-y-4">
            <p className="text-slate-600 text-sm text-center">{message}</p>

            {status === "ready" && (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nova senha</label>
                  <input
                    type="password"
                    placeholder="Digite a nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirmar senha</label>
                  <input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    disabled={submitting}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={submitting}
                >
                  {submitting ? "Enviando..." : "Redefinir senha"}
                </button>
              </form>
            )}

            {status === "success" && (
              <div className="space-y-3 text-center">
                <p className="text-green-600 font-medium">{message}</p>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full py-3 rounded-2xl border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                >
                  Voltar ao login
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
