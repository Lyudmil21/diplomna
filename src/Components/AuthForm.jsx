import { useState } from "react";
import { supabase } from "../Services/supabaseClient.jsx";
import { useAuth } from "../Contexts/AuthContext.jsx";

export default function AuthForm() {
  const { user } = useAuth(); 
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
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setMessage(error.message);
        else setMessage("Check your email to confirm registration!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMessage(error.message);
        else setMessage("Logged in successfully!");
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
    setMessage("Logged out successfully!");
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-slate-100 text-center">
        <div className="mb-4 text-cyan-600 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <p className="text-slate-600 mb-6">Logged in as <span className="font-bold text-slate-900">{user.email}</span></p>
        <button
          onClick={handleLogout}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 cursor-pointer shadow-md"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      <div className="bg-cyan-600 p-8 text-white text-center">
        <h1 className="text-3xl font-extrabold mb-2 italic tracking-tight">PlugHub</h1>
        <p className="text-cyan-100 text-sm leading-relaxed">
          Welcome to PlugHub! Sign in or Register to locate charging stations nearby.
        </p>
      </div>

      <div className="p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
            {isRegister ? "Create an Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
          />
          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg shadow-cyan-100 mt-2"
          >
            {isRegister ? "Register" : "Sign In"}
          </button>
        </form>

        <div className="relative my-8 text-center">
            <span className="bg-white px-4 text-slate-400 text-sm relative z-10">OR</span>
            <div className="absolute top-1/2 left-0 w-full border-t border-slate-100"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-all cursor-pointer"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-slate-500 text-sm">
          {isRegister ? "Already have an account?" : "New to PlugHub?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-cyan-600 hover:text-cyan-800 font-bold transition-colors cursor-pointer"
          >
            {isRegister ? "Login here" : "Create one now"}
          </button>
        </p>

        {message && (
          <div className={`mt-6 p-3 rounded-lg text-sm text-center font-medium ${message.includes("error") || message.includes("failed") ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}