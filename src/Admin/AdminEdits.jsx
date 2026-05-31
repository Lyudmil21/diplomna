import { useState } from "react";
import { supabase } from "../Services/supabaseClient.jsx";
import { useAuth } from "../Contexts/AuthContext.jsx";

const authTranslations = {
  en: {
    welcomeTitle: "Welcome to PlugHub!",
    welcomeSubtitle: "Sign in or Register to locate charging stations nearby.",
    loginHeader: "Welcome Back",
    registerHeader: "Create an Account",
    placeholderUser: "Username",
    placeholderEmail: "Email",
    placeholderPassword: "Password",
    btnRegister: "Register",
    btnSignIn: "Sign In",
    dividerOr: "OR",
    btnGoogle: "Continue with Google",
    promptRegister: "New to PlugHub?",
    promptLogin: "Already have an account?",
    switchCreate: "Create one now",
    switchLogin: "Login here",
    msgCheckEmail: "Check your email to confirm registration!",
    msgSuccessLogin: "Logged in successfully!",
    msgSuccessLogout: "Logged out successfully!",
    labelLoggedAs: "Logged in as",
    btnLogout: "Logout"
  },
  bg: {
    welcomeTitle: "Добре дошли в PlugHub!",
    welcomeSubtitle: "Влезте или се регистрирайте, за да намерите зарядни станции наблизо.",
    loginHeader: "Добре дошли отново",
    registerHeader: "Създаване на профил",
    placeholderUser: "Потребителско име",
    placeholderEmail: "Имейл",
    placeholderPassword: "Парола",
    btnRegister: "Регистрация",
    btnSignIn: "Вход",
    dividerOr: "ИЛИ",
    btnGoogle: "Вход с Google",
    promptRegister: "Нов сте в PlugHub?",
    promptLogin: "Вече имате профил?",
    switchCreate: "Създайте нов тук",
    switchLogin: "Влезте тук",
    msgCheckEmail: "Проверете имейла си, за да потвърдите регистрацията!",
    msgSuccessLogin: "Успешен вход!",
    msgSuccessLogout: "Успешен изход!",
    labelLoggedAs: "Влязохте като",
    btnLogout: "Изход"
  }
};

export default function AuthForm() {
  const { user, lang } = useAuth(); 
  const t = authTranslations[lang || "en"];
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        });

        if (error) setMessage(error.message);
        else setMessage(t.msgCheckEmail);

      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMessage(error.message);
        else setMessage(t.msgSuccessLogin);
      }

    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setMessage(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessage(t.msgSuccessLogout);
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-slate-100 text-center">
        <div className="mb-4 text-cyan-600 flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-600 mb-6">
          {t.labelLoggedAs} <span className="font-bold text-slate-900">{user.email}</span>
        </p>
        <button
          onClick={handleLogout}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md"
        >
          {t.btnLogout}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      <div className="bg-cyan-600 p-8 text-white text-center">
        <h1 className="text-3xl font-extrabold mb-2 italic tracking-tight">PlugHub</h1>
        <p className="text-cyan-100 text-sm leading-relaxed">
          {t.welcomeTitle} {t.welcomeSubtitle}
        </p>
      </div>

      <div className="p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {isRegister ? t.registerHeader : t.loginHeader}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <input
              type="text"
              placeholder={t.placeholderUser}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
            />
          )}
          <input
            type="email"
            placeholder={t.placeholderEmail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
          />
          <input
            type="password"
            placeholder={t.placeholderPassword}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
          />
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg shadow-cyan-100 mt-2"
          >
            {isRegister ? t.btnRegister : t.btnSignIn}
          </button>
        </form>

        <div className="relative my-8 text-center">
          <span className="bg-white px-4 text-slate-400 text-sm relative z-10">{t.dividerOr}</span>
          <div className="absolute top-1/2 left-0 w-full border-t border-slate-100"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-all cursor-pointer"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          {t.btnGoogle}
        </button>

        <p className="mt-8 text-center text-slate-500 text-sm">
          {isRegister ? t.promptLogin : t.promptRegister}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-cyan-600 hover:text-cyan-800 font-bold transition-colors cursor-pointer"
          >
            {isRegister ? t.switchLogin : t.switchCreate}
          </button>
        </p>

        {message && (
          <div className={`mt-6 p-3 rounded-lg text-sm text-center font-medium ${
            message.toLowerCase().includes("error") || 
            message.toLowerCase().includes("failed") || 
            message.toLowerCase().includes("invalid") 
              ? "bg-rose-50 text-rose-600" 
              : "bg-emerald-50 text-emerald-600"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}