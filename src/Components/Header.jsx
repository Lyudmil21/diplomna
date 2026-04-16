import { useAuth } from "../Contexts/AuthContext.jsx";
import { supabase } from "../Services/supabaseClient.jsx";

export default function Header() {
  const { user, username } = useAuth();

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 shadow-sm border border-slate-100 rounded-2xl mb-6 gap-4">
      <div className="flex items-center gap-2">
        <div className="bg-cyan-500 p-2 rounded-lg shadow-cyan-100 shadow-lg">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
          Plug<span className="text-cyan-500">Hub</span>
        </h1>
      </div>
      
      {user ? (
        <div className="flex items-center gap-5 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex flex-col sm:items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Logged in as</span>
            <span className="text-sm font-bold text-slate-800 italic">
              {username || user.email?.split('@')[0]}
            </span>
          </div>
          
          <button 
            onClick={logout}
            className="bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all hover:shadow-sm active:scale-95 cursor-pointer"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-xs text-amber-700 font-bold uppercase tracking-tight">
            Guest Mode
          </span>
        </div>
      )}
    </header>
  );
}