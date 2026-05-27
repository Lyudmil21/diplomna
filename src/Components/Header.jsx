import { useState } from "react";
import { useAuth } from "../Contexts/AuthContext.jsx";
import { supabase } from "../Services/supabaseClient.jsx";

export default function Header({ searchQuery, setSearchQuery, filters, setFilters, sortBy, setSortBy, activeTab, setActiveTab }) {
  const { user, username, isAdmin } = useAuth(); 
  const [showAdvanced, setShowAdvanced] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-white p-5 shadow-sm border border-slate-100 rounded-3xl mb-6 flex flex-col gap-5 transition-all">
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab?.("map")}>
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
        
        <div className="flex items-center gap-5 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="bg-slate-200 text-slate-600 p-1.5 rounded-lg shrink-0 hidden sm:block">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Logged in as</span>
              <span className="text-sm font-bold text-slate-800 italic">
                {username || user?.email?.split('@')[0]}
              </span>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all hover:shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-slate-100/80"></div>

      <div className="flex flex-col md:flex-row gap-4 items-center w-full">
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Search by city, address, name or rating..." 
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-slate-700 font-medium text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <select 
              className="w-full pl-10 pr-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-600 cursor-pointer text-sm appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="distance">Nearest</option>
              <option value="power">Highest Power</option>
              <option value="price">Lowest Price</option>
              <option value="rating">Highest Rating</option>
            </select>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg>
            </span>
          </div>

          <button 
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${showAdvanced ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-100' : 'bg-white border-slate-200 text-slate-600'}`}
            aria-label="Toggle filter panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1 items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3 text-cyan-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              Connector
            </label>
            <select 
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none"
              value={filters.connector}
              onChange={(e) => setFilters({...filters, connector: e.target.value})}
            >
              <option value="all">All Types</option>
              <option value="CCS">CCS (Fast DC)</option>
              <option value="Type 2">Type 2 (AC)</option>
              <option value="CHAdeMO">CHAdeMO</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1 items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3 text-cyan-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Min Power (kW)
            </label>
            <select 
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none"
              value={filters.minPower}
              onChange={(e) => setFilters({...filters, minPower: Number(e.target.value)})}
            >
              <option value="0">Any Power</option>
              <option value="22">22kW+</option>
              <option value="50">50kW+</option>
              <option value="150">150kW+</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3 text-amber-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.173-.434.768-.434.94 0l3.102 6.312 6.965 1.013c.493.071.693.686.337 1.036l-5.04 4.912 1.19 6.936c.088.514-.452.905-.902.663L12 19.184l-6.213 3.29c-.45.242-.99-.149-.902-.663l1.19-6.936-5.04-4.912c-.356-.35-.155-.965.337-1.036l6.965-1.013 3.102-6.312z" />
              </svg>
              Min Rating
            </label>
            <select 
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none"
              value={filters.minRating || 0}
              onChange={(e) => setFilters({...filters, minRating: Number(e.target.value)})}
            >
              <option value="0">Any Rating</option>
              <option value="3">3.0+ Stars</option>
              <option value="4">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1 items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3 text-emerald-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Max Price: <span className="text-cyan-500 font-black ml-0.5">{filters.maxPrice} euro/kWh</span>
            </label>
            <input 
              type="range" min="0" max="2" step="0.1" 
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-3"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: parseFloat(e.target.value)})}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1 items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3 text-cyan-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.015 9.015 0 0 1 8.716 6.747M12 3a9.015 9.015 0 0 0-8.716 6.747M12 9h.008v.008H12V9zm6 3h.008v.008H18V12zM6 12h.008v.008H6V12zm6 3h.008v.008H12V15z" />
              </svg>
              Network
            </label>
            <select 
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-cyan-400 outline-none"
              value={filters.operator}
              onChange={(e) => setFilters({...filters, operator: e.target.value})}
            >
              <option value="all">All Networks</option>
              <option value="Eldrive">Eldrive</option>
              <option value="Fines">Fines</option>
              <option value="Tesla">Tesla Supercharger</option>
            </select>
          </div>
        </div>
      )}
    </header>
  );
}