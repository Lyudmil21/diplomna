import { useEffect, useState } from "react";
import { supabase } from "../Services/supabaseClient.jsx";


const adminTranslations = {
  en: {
    
    
  }, 
  
  bg: {

  }
}

export default function AdminEditsDashboard() {
  const [edits, setEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");
  const t = adminTranslations[lang || "en"];

  useEffect(() => {
    fetchPendingEdits();
  }, []);

  const fetchPendingEdits = async () => {
    setLoading(true);
    try {
      const { data: rawEdits, error: editsError } = await supabase
        .from("station_edits")
        .select("*")
        .eq("status", "pending");

      if (editsError) throw editsError;
      if (!rawEdits || rawEdits.length === 0) {
        setEdits([]);
        setLoading(false);
        return;
      }

      const stationIds = [...new Set(rawEdits.map((e) => e.station_id).filter(Boolean))];
      const userIds = [...new Set(rawEdits.map((e) => e.suggested_by).filter(Boolean))];

      const [stationsResponse, usersResponse] = await Promise.all([
        stationIds.length > 0
          ? supabase.from("stations").select("id, name, address, operator, connector_type, power, price").in("id", stationIds)
          : { data: [] },
        userIds.length > 0
          ? supabase.from("users").select("id, username").in("id", userIds)
          : { data: [] }
      ]);

      const stationMap = new Map(stationsResponse.data?.map(s => [s.id, s]) || []);
      const userMap = new Map(usersResponse.data?.map(u => [u.id, u]) || []);

      const assembledEdits = rawEdits.map((edit) => {
        const userMatch = userMap.get(edit.suggested_by);
        
        return {
          ...edit,
          stations: stationMap.get(edit.station_id) || null,
          displayUser: userMatch?.username || (edit.suggested_by ? `User (${edit.suggested_by.slice(0, 8)})` : "Unknown User"),
        };
      });

      setEdits(assembledEdits);
    } catch (err) {
      console.error("Error gathering dashboard data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (edit) => {
    try {
      const { error: updateError } = await supabase
        .from("stations")
        .update({
          name: edit.new_data?.name ?? edit.stations?.name,
          address: edit.new_data?.address ?? edit.stations?.address,
          operator: edit.new_data?.operator ?? edit.stations?.operator,
          connector_type: edit.new_data?.connector_type ?? edit.stations?.connector_type,
          power: edit.new_data?.power ?? edit.stations?.power,
          price: edit.new_data?.price ?? edit.stations?.price,
        })
        .eq("id", edit.station_id);

      if (updateError) throw updateError;

      const { error: statusError } = await supabase
        .from("station_edits")
        .update({ status: "approved" })
        .eq("id", edit.id);

      if (statusError) throw statusError;

      fetchPendingEdits();
    } catch (err) {
      console.error("Approval flow failed:", err.message);
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleReject = async (editId) => {
    try {
      const { error: rejectError } = await supabase
        .from("station_edits")
        .update({ status: "rejected" })
        .eq("id", editId);

      if (rejectError) throw rejectError;

      fetchPendingEdits();
    } catch (err) {
      console.error("Rejection flow failed:", err.message);
      alert(`Action failed: ${err.message}`);
    }
  };

  if (loading) return <div className="text-center p-10 text-slate-500">Loading pending reviews...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <span className="p-2 bg-amber-100 rounded-xl flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-amber-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </span>
        Pending Station Modifications ({edits.length})
      </h2>

      {edits.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-500 font-medium">
          No pending edits to review. Looking good!
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {edits.map((edit) => {
            const newFields = edit.new_data || {};
            const liveFields = edit.stations || {};

            return (
              <div key={edit.id} className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 flex flex-col gap-5 transition-all hover:shadow-md">
                
                <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-3">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Suggested by:{" "}
                    <strong className="text-slate-700 italic font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                      {edit.displayUser}
                    </strong>
                  </span>
                  <span className="bg-amber-50 text-amber-700 font-black px-2.5 py-1 rounded-lg uppercase tracking-wider text-[10px] border border-amber-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Pending Review
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* LIVE DATA CONTAINER */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block border-b border-slate-200/60 pb-1">
                      Current Live Station Data
                    </span>
                    
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Name</span>
                      <h3 className="font-bold text-slate-800 text-base">{liveFields.name || "—"}</h3>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Address</span>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed">{liveFields.address || "—"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/50 mt-1">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Network</span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-200/60 px-2 py-1 rounded-md block truncate">{liveFields.operator || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Connector</span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-200/60 px-2 py-1 rounded-md block truncate">{liveFields.connector_type || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Power</span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-200/60 px-2 py-1 rounded-md block truncate">{liveFields.power ? `${liveFields.power} kW` : "—"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Charging Cost</span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-200/60 px-2 py-1 rounded-md block truncate">{liveFields.price || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-cyan-50/30 p-5 rounded-2xl border border-cyan-100/50 flex flex-col gap-4">
                    <span className="text-[10px] font-black uppercase text-cyan-600 tracking-widest block border-b border-cyan-100 pb-1">
                      Suggested Corrections
                    </span>
                    
                    <div>
                      <span className="text-[10px] font-bold text-cyan-600/70 uppercase tracking-wider block mb-0.5">Name</span>
                      <h3 className={`font-black text-base ${newFields.name && newFields.name !== liveFields.name ? "text-cyan-600 underline decoration-cyan-400 decoration-2 font-black" : "text-slate-700"}`}>
                        {newFields.name || liveFields.name || "—"}
                      </h3>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-cyan-600/70 uppercase tracking-wider block mb-0.5">Address</span>
                      <p className={`text-xs font-bold leading-relaxed ${newFields.address && newFields.address !== liveFields.address ? "text-cyan-700 underline decoration-cyan-400 decoration-2" : "text-slate-600"}`}>
                        {newFields.address || liveFields.address || "—"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-cyan-100/70 mt-1">
                      <div>
                        <span className="text-[9px] font-bold text-cyan-600/70 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-2.5 h-2.5 text-cyan-500 shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.015 9.015 0 0 1 8.716 6.747M12 3a9.015 9.015 0 0 0-8.716 6.747" />
                          </svg>
                          Network
                        </span>
                        <span className={`text-xs font-black px-2 py-1 rounded-md block truncate ${newFields.operator && newFields.operator !== liveFields.operator ? "bg-cyan-500 text-white shadow-sm" : "bg-slate-100 text-slate-700 font-bold"}`}>
                          {newFields.operator || liveFields.operator || "—"}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-[9px] font-bold text-cyan-600/70 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-2.5 h-2.5 text-cyan-500 shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                          </svg>
                          Connector
                        </span>
                        <span className={`text-xs font-black px-2 py-1 rounded-md block truncate ${newFields.connector_type && newFields.connector_type !== liveFields.connector_type ? "bg-cyan-500 text-white shadow-sm" : "bg-slate-100 text-slate-700 font-bold"}`}>
                          {newFields.connector_type || liveFields.connector_type || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold text-cyan-600/70 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-2.5 h-2.5 text-cyan-500 shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                          </svg>
                          Power
                        </span>
                        <span className={`text-xs font-black px-2 py-1 rounded-md block truncate ${newFields.power && Number(newFields.power) !== Number(liveFields.power) ? "bg-cyan-500 text-white shadow-sm" : "bg-slate-100 text-slate-700 font-bold"}`}>
                          {newFields.power ? `${newFields.power} kW` : (liveFields.power ? `${liveFields.power} kW` : "—")}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold text-cyan-600/70 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-2.5 h-2.5 text-cyan-500 shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.268-.118a5.5 5.5 0 003.064-5.122A4.5 4.5 0 0012 3.375a4.5 4.5 0 00-4.332 4.307M12 18a4.5 4.5 0 004.332-4.307M12 18v1.5a1.5 1.5 0 01-3 0v-.318" />
                          </svg>
                          Price Change
                        </span>
                        <span className={`text-xs font-black px-2 py-1 rounded-md block truncate ${newFields.price && newFields.price !== liveFields.price ? "bg-cyan-500 text-white shadow-sm" : "bg-slate-100 text-slate-700 font-bold"}`}>
                          {newFields.price || liveFields.price || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => handleReject(edit.id)}
                    className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject Change
                  </button>
                  <button
                    onClick={() => handleApprove(edit)}
                    className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white shadow-md shadow-cyan-100 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Approve & Overwrite
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}