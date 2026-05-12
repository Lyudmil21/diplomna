export default function StationList({ stations, isAdmin, onApprove, onDelete, onEdit }) {
  const stationText = stations.length === 1 ? "Station" : "Stations";

  return (
    <div className="mt-8 p-6 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {isAdmin ? "Admin Control Hub" : "Electric Directory"}
          </h3>
          <p className="text-slate-500 text-sm font-medium">Browse and manage charging locations</p>
        </div>
        <span className="bg-cyan-50 text-cyan-700 text-xs font-black px-4 py-2 rounded-xl border border-cyan-100 uppercase tracking-widest">
          {stations.length} {stationText} Found
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-400 uppercase text-[10px] font-black tracking-[0.15em]">
              <th className="px-4 py-2">Location & Address</th>
              <th className="px-4 py-2">Network & Tech</th>
              <th className="px-4 py-2 text-center">Price / Distance</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">{isAdmin ? "Management" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station) => (
              <tr key={station.id} className="group hover:bg-slate-50 transition-all duration-200">
                <td className="px-4 py-4 bg-white group-hover:bg-slate-50 rounded-l-2xl border-y border-l border-slate-50 transition-colors">
                  <div className="font-bold text-slate-900 text-base">{station.name}</div>
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <span className="text-cyan-500">📍</span> {station.address}
                  </div>
                </td>

                <td className="px-4 py-4 bg-white group-hover:bg-slate-50 border-y border-slate-50 transition-colors">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-black text-cyan-600 uppercase tracking-tighter">
                      {station.operator || "Independent"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                        {station.connector_type || "Type 2"}
                      </span>
                      <span className="bg-cyan-500 text-white px-2 py-0.5 rounded text-[10px] font-black italic">
                        {station.power ? `${station.power}kW` : "N/A"}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 bg-white group-hover:bg-slate-50 border-y border-slate-50 text-center transition-colors">
                  <div className="text-sm font-bold text-slate-700">
                    {station.price ? `${station.price} euro/kWh` : "Free"}
                  </div>
                  {station.distance && station.distance !== Infinity && (
                    <div className="text-[10px] font-black text-cyan-500 uppercase">
                      {station.distance.toFixed(1)} km away
                    </div>
                  )}
                </td>

                <td className="px-4 py-4 bg-white group-hover:bg-slate-50 border-y border-slate-50 transition-colors">
                  {station.is_approved ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider border border-amber-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                      Pending Approval
                    </span>
                  )}
                </td>

                {/* ✨ UPDATED: Cell handles both user types flawlessly */}
                <td className="px-4 py-4 bg-white group-hover:bg-slate-50 rounded-r-2xl border-y border-r border-slate-50 text-right transition-colors">
                  <div className="flex justify-end gap-2 items-center">
                    {isAdmin ? (
                      <>
                        <button 
                          onClick={() => onEdit(station)}
                          className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black uppercase py-2 px-3 rounded-xl transition-all active:scale-95 cursor-pointer"
                        >
                          Edit
                        </button>

                        {!station.is_approved && (
                          <button 
                            onClick={() => onApprove(station.id)}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white text-[10px] font-black uppercase py-2 px-3 rounded-xl shadow-md shadow-cyan-100 cursor-pointer transition-all active:scale-95"
                          >
                          Approve
                          </button>
                        )}
                        
                        <button 
                          onClick={() => onDelete(station.id)}
                          className="bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 text-[10px] font-black uppercase py-2 px-3 rounded-xl cursor-pointer transition-all active:scale-95"
                        >
                        Delete
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => onEdit(station)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white text-[10px] font-black uppercase py-2 px-4 rounded-xl shadow-md shadow-cyan-100 cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                      >
                        Review / Suggest
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stations.length === 0 && (
        <div className="text-center py-20 bg-slate-50/50 rounded-3xl mt-4 border-2 border-dashed border-slate-100">
          <div className="text-4xl mb-2">⚡</div>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No matching stations found in your area.</p>
        </div>
      )}
    </div>
  );
}