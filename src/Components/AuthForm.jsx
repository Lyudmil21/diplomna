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
    welcomeSubtitle: "Влезте или се регистрирайте, за да откриете зарядни станции наблизо.",
    loginHeader: "Добре дошли отново",
    registerHeader: "Създаване на профил",
    placeholderUser: "Потребителско име",
    placeholderEmail: "Имейл",
    placeholderPassword: "Парола",
    btnRegister: "Регистрация",
    btnSignIn: "Вход",
    dividerOr: "ИЛИ",
    btnGoogle: "Вход с Google",
    promptRegister: "Нови сте в PlugHub?",
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
  const { user, lang, setLang } = useAuth(); 
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
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-slate-100 text-center relative">
        <div className="absolute top-4 right-4 bg-slate-50 border border-slate-200 shadow-sm rounded-xl px-2.5 py-1.5 flex items-center gap-2 transition-all hover:border-slate-300">
          <div className="flex items-center shrink-0 pointer-events-none">
            {lang === "en" ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-4 h-2.5 rounded-sm shrink-0 shadow-sm">
                <clipPath id="s"><path d="M0 0v30h60V0z"/></clipPath>
                <path d="M0 0v30h60V0z" fill="#012169"/>
                <path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6" clipPath="url(#s)"/>
                <path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#s)"/>
                <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
                <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className="w-4 h-2.5 rounded-sm border border-slate-200 shrink-0 shadow-sm">
                <path d="M0 0h5v3H0z" fill="#fff"/>
                <path d="M0 1h5v2H0z" fill="#00966E"/>
                <path d="M0 2h5v1H0z" fill="#D62612"/>
              </svg>
            )}
          </div>
          <select
            value={lang || "en"}
            onChange={(e) => setLang(e.target.value)}
            className="bg-transparent text-xs font-black text-slate-700 outline-none pr-1 cursor-pointer tracking-wider uppercase appearance-none h-full z-10"
          >
            <option value="en" className="font-sans font-bold text-slate-800">EN</option>
            <option value="bg" className="font-sans font-bold text-slate-800">BG</option>
          </select>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-2.5 h-2.5 text-slate-400 pointer-events-none absolute right-2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        <div className="mb-4 text-cyan-600 flex justify-center mt-6">
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
    <div className="max-w-md mx-auto mt-10 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative">
      
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm rounded-xl px-2.5 py-1.5 flex items-center gap-2 transition-all hover:border-slate-300 z-20">
        <div className="flex items-center shrink-0">
          {lang === "en" ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-4 h-2.5 rounded-sm shrink-0 shadow-sm">
              <clipPath id="s"><path d="M0 0v30h60V0z"/></clipPath>
              <path d="M0 0v30h60V0z" fill="#012169"/>
              <path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6" clipPath="url(#s)"/>
              <path d="M0 0l60 30M60 0L0 30" stroke="#C8102E" strokeWidth="4" clipPath="url(#s)"/>
              <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
              <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className="w-4 h-2.5 rounded-sm border border-slate-200 shrink-0 shadow-sm">
              <path d="M0 0h5v3H0z" fill="#fff"/>
              <path d="M0 1h5v2H0z" fill="#00966E"/>
              <path d="M0 2h5v1H0z" fill="#D62612"/>
            </svg>
          )}
        </div>

        <select
          value={lang || "en"}
          onChange={(e) => setLang(e.target.value)}
          className="bg-transparent text-xs font-black text-slate-700 outline-none pr-1 cursor-pointer tracking-wider uppercase appearance-none"
        >
          <option value="en" className="font-sans font-bold text-slate-800">EN</option>
          <option value="bg" className="font-sans font-bold text-slate-800">BG</option>
        </select>

        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-2.5 h-2.5 text-slate-400 pointer-events-none -ml-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      <div className="bg-cyan-600 p-8 text-white text-center">
        <h1 className="text-3xl font-extrabold mb-2 italic tracking-tight">PlugHub</h1>
        <p className="text-cyan-100 text-sm leading-relaxed max-w-[80%] mx-auto">
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