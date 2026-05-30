import { useAuth } from "../Contexts/AuthContext.jsx";

const listTranslations = {
  en: {
    adminTitle: "Admin Control Hub",
    userTitle: "Electric Directory",
    subtitle: "Browse and manage charging locations",
    found: "Found",
    thLocation: "Location & Address",
    thNetwork: "Network & Tech",
    thPriceDistance: "Price / Distance",
    thStatus: "Status",
    thManagement: "Management",
    thActions: "Actions",
    independent: "Independent",
    free: "Free",
    euroKwh: "euro/kWh",
    away: "km away",
    approved: "Approved",
    pending: "Pending Approval",
    btnEdit: "Edit",
    btnApprove: "Approve",
    btnDelete: "Delete",
    btnReview: "Suggest an Edit",
    noStations: "No matching stations found in your area.",
    stationSingular: "Station",
    stationPlural: "Stations"
  },

  bg: {
    adminTitle: "Администраторски панел",
    userTitle: "Каталог",
    subtitle: "Разгледайте и управлявайте зарядните локации",
    found: "Намерени",
    thLocation: "Локация и адрес",
    thNetwork: "Мрежа и технология",
    thPriceDistance: "Цена / Разстояние",
    thStatus: "Статус",
    thManagement: "Управление",
    thActions: "Действия",
    independent: "Независима",
    free: "Безплатно",
    euroKwh: "евро/kWh",
    away: "км до станцията",
    approved: "Одобрена",
    pending: "Чака одобрение",
    btnEdit: "Редактирай",
    btnApprove: "Одобри",
    btnDelete: "Изтрий",
    btnReview: "Предложи редакция",
    noStations: "Няма намерени съвпадащи станции във вашия район.",
    stationSingular: "Станция",
    stationPlural: "Станции"
  }
};

export default function StationList({ stations, isAdmin, onApprove, onDelete, onEdit }) {
  const { lang } = useAuth();
  const t = listTranslations[lang || "en"];

  const stationText = stations.length === 1 ? t.stationSingular : t.stationPlural;

  return (
    <div className="mt-8 p-6 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {isAdmin ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6 text-slate-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6 text-cyan-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5-11.5-4.5 1.636M17.25 10.5l1.25-5.75m-1.25 5.75H1.5" />
              </svg>
            )}
            {isAdmin ? t.adminTitle : t.userTitle}
          </h3>
          <p className="text-slate-500 text-sm font-medium">{t.subtitle}</p>
        </div>
        <span className="bg-cyan-50 text-cyan-700 text-xs font-black px-4 py-2 rounded-xl border border-cyan-100 uppercase tracking-widest flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-cyan-500 animate-pulse">
            <path fillRule="evenodd" d="M11.55 22.5c2.781 0 5.033-2.255 5.033-5.04c0-4.32-4.358-9.105-4.743-9.523a.39.39 0 0 0-.58 0c-.385.418-4.743 4.203-4.743 9.523c0 2.785 2.252 5.04 5.033 5.04ZM12 19.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
          </svg>
          {stations.length} {stationText} {t.found}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-400 uppercase text-[10px] font-black tracking-[0.15em]">
              <th className="px-4 py-2">{t.thLocation}</th>
              <th className="px-4 py-2">{t.thNetwork}</th>
              <th className="px-4 py-2 text-center">{t.thPriceDistance}</th>
              <th className="px-4 py-2">{t.thStatus}</th>
              <th className="px-4 py-2 text-right">{isAdmin ? t.thManagement : t.thActions}</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station) => (
              <tr key={station.id} className="group hover:bg-slate-50 transition-all duration-200">
                <td className="px-4 py-4 bg-white group-hover:bg-slate-50 rounded-l-2xl border-y border-l border-slate-50 transition-colors">
                  <div className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                    {station.name}
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold text-xs bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 whitespace-nowrap">
                      ★ {station.rating ? Number(station.rating).toFixed(1) : "0.0"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-cyan-500 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    {station.address}
                  </div>
                </td>

                <td className="px-4 py-4 bg-white group-hover:bg-slate-50 border-y border-slate-50 transition-colors">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-black text-cyan-600 uppercase tracking-tighter flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                      </svg>
                      {station.operator || t.independent}
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
                  <div className="text-sm font-bold text-slate-700 flex items-center justify-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-emerald-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {station.price ? `${station.price} ${t.euroKwh}` : t.free}
                  </div>
                  {station.distance && station.distance !== Infinity && (
                    <div className="text-[10px] font-black text-cyan-500 uppercase mt-0.5">
                      {station.distance.toFixed(1)} {t.away}
                    </div>
                  )}
                </td>

                <td className="px-4 py-4 bg-white group-hover:bg-slate-50 border-y border-slate-50 transition-colors">
                  {station.is_approved ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {t.approved}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider border border-amber-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                      {t.pending}
                    </span>
                  )}
                </td>

                <td className="px-4 py-4 bg-white group-hover:bg-slate-50 rounded-r-2xl border-y border-r border-slate-50 text-right transition-colors">
                  <div className="flex justify-end gap-2 items-center">
                    {isAdmin ? (
                      <>
                        <button 
                          onClick={() => onEdit(station)}
                          className="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-black uppercase py-2 px-3 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                          </svg>
                          {t.btnEdit}
                        </button>

                        {!station.is_approved && (
                          <button 
                            onClick={() => onApprove(station.id)}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white text-[10px] font-black uppercase py-2 px-3 rounded-xl shadow-md shadow-cyan-100 cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            {t.btnApprove}
                          </button>
                        )}
                        
                        <button 
                          onClick={() => onDelete(station.id)}
                          className="bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 text-[10px] font-black uppercase py-2 px-3 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                          {t.btnDelete}
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => onEdit(station)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white text-[10px] font-black uppercase py-2 px-4 rounded-xl shadow-md shadow-cyan-100 cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/xl" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                        </svg>
                        {t.btnReview}
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-slate-300 mx-auto mb-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{t.noStations}</p>
        </div>
      )}
    </div>
  );
}