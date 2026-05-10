import { useState } from "react";

export default function FilterBar({ searchQuery, setSearchQuery, filters, setFilters, sortBy, setSortBy }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 transition-all">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></span>
          <input 
            type="text" 
            placeholder="Search by city, address or name..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-slate-700 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="flex-1 md:w-48 p-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-600 cursor-pointer text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="distance">Nearest</option>
            <option value="power">Highest Power</option>
            <option value="price">Lowest Price</option>
            <option value="rating">Highest Rating</option>
          </select>

          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${showAdvanced ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-100' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 pt-6 mt-6 border-t border-slate-50 animate-in fade-in slide-in-from-top-2">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Connector</label>
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Min Power (kW)</label>
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Min Rating</label>
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
              Max Price: <span className="text-cyan-500 font-black">{filters.maxPrice} lv.</span>
            </label>
            <input 
              type="range" min="0" max="2" step="0.1" 
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cyan-500 mt-3"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: parseFloat(e.target.value)})}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Network</label>
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
    </div>
  );
}