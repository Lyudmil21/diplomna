import { useState } from "react";
import Header from "./Components/UI/Header.jsx";
import AuthForm from "./Components/AuthForm.jsx";
import AddStationForm from "./Components/UI/AddStationForm.jsx";
import Map from "./Components/Map/Map.jsx";
import StationList from "./Components/UI/StationList.jsx";
import EditStationModal from "./Components/UI/EditStationModal.jsx"; 
import AdminEditsDashboard from "./Admin/AdminEdits.jsx"; 
import { useAuth } from "./Contexts/AuthContext.jsx";
import { useStationFilters } from "./Components/Filters/useStationFilters.jsx";
import { useStationData } from "./Components/useStationData.jsx"; 

const appTranslations = {
  en: {
    loading: "Loading PlugHub...",
    map: "Map",
    list: "List",
    edits: "Edits",
    addStation: "Add Station",
    startTracking: "Start",
    stopTracking: "Stop"
  },
  bg: {
    loading: "Зареждане на PlugHub...",
    map: "Карта",
    list: "Списък",
    edits: "Редакции",
    addStation: "Добави Станция",
    startTracking: "Старт",
    stopTracking: "Стоп"
  }
};

function App() {
  const { user, isAdmin, loading, lang } = useAuth();
  const [activeTab, setActiveTab] = useState("map");
  const [addingStation, setAddingStation] = useState(false);
  const [editingStation, setEditingStation] = useState(null); 
  const { stations, setStations, handleApprove, handleDelete, handleStationUpdateOrSuggest } = useStationData(user, isAdmin, loading);
  const t = appTranslations[lang || "en"]; 

  const { 
    filteredStations, searchQuery, setSearchQuery, filters, setFilters, sortBy, setSortBy,isTracking, setIsTracking, liveLocation 
  } = useStationFilters(stations, null); 

  const refreshStationList = (updatedStationId, updatedFields) => {
    setStations(prev => prev.map(s => s.id === updatedStationId ? { ...s, ...updatedFields } : s));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">{t.loading}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans relative">
      {!user ? (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4">
          <AuthForm />
        </div>
      ) : (
        <div className="animate-in fade-in">
          
          <Header 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
            sortBy={sortBy}
            setSortBy={setSortBy}
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
          />
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-8 bg-slate-50 p-2 rounded-3xl w-fit mx-auto border border-slate-100 shadow-sm">
            
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                isTracking 
                  ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-600 animate-pulse shadow-md shadow-rose-100" 
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isTracking ? "bg-white animate-ping" : "bg-emerald-500"}`}></span>
              {isTracking ? t.stopTracking : t.startTracking}
            </button>

            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

            <div className="flex bg-slate-200/50 p-1 rounded-2xl">
              {["map", "list"].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => { setActiveTab(tab); setAddingStation(false); }}
                  className={`px-8 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === tab && !addingStation ? "bg-white text-cyan-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {t[tab]}
                </button>
              ))}

              {isAdmin && (
                <button 
                  onClick={() => { setActiveTab("admin-edits"); setAddingStation(false); }}
                  className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === "admin-edits" && !addingStation ? "bg-amber-500 text-white shadow-sm" : "text-amber-600 hover:bg-amber-50/50"}`}
                >
                  {t.edits}
                </button>
              )}
            </div>
            
            <div className="hidden sm:block w-px h-6 bg-slate-200 mx-2"></div>
            
            <button 
              onClick={() => setAddingStation(true)} 
              className={`px-8 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${addingStation ? "bg-slate-800 text-white" : "bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-100"}`}
            >
              {t.addStation}
            </button>
          </div>

          <main>
            {addingStation ? (
              <AddStationForm 
                onCancel={() => setAddingStation(false)} 
                onStationAdded={(s) => { setStations(prev => [s, ...prev]); setAddingStation(false); setActiveTab("list"); }} 
              />
            ) : activeTab === "map" ? (
              <Map stations={filteredStations} isAdmin={isAdmin} onApprove={handleApprove} onDelete={handleDelete} onEdit={setEditingStation} userLocation={liveLocation}/>
            ) : activeTab === "list" ? (
              <StationList stations={filteredStations} isAdmin={isAdmin} onApprove={handleApprove} onDelete={handleDelete} onEdit={setEditingStation} />
            ) : (
              <AdminEditsDashboard onStationModifiedInView={refreshStationList} />
            )}
          </main>
        </div>
      )}

      {editingStation && (
        <EditStationModal 
          station={editingStation} 
          onClose={() => setEditingStation(null)} 
          onUpdate={handleStationUpdateOrSuggest} 
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

export default App;