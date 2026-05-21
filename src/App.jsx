import { useState, useEffect } from "react";
import Header from "./Components/Header.jsx";
import AuthForm from "./Components/AuthForm.jsx";
import AddStationForm from "./Components/AddStationForm.jsx";
import Map from "./Components/Map.jsx";
import StationList from "./Components/StationList.jsx";
import EditStationModal from "./Components/EditStationModal.jsx"; 
import { useAuth } from "./Contexts/AuthContext.jsx";
import { useStationFilters } from "./Components/useStationFilters.jsx";
import { useStationData } from "./Components/useStationData.jsx"; 

function App() {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("map");
  const [addingStation, setAddingStation] = useState(false);
  const [editingStation, setEditingStation] = useState(null); 
  const [userLocation, setUserLocation] = useState(null);

  const { stations, setStations, handleApprove, handleDelete, handleStationUpdateOrSuggest } = useStationData(user, isAdmin, loading);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => console.warn("Location denied"), { enableHighAccuracy: true }
    );
  }, []);

  const { filteredStations, searchQuery, setSearchQuery, filters, setFilters, sortBy, setSortBy } = useStationFilters(stations, userLocation);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Loading PlugHub...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans relative">
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {!user ? (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4">
          <AuthForm />
        </div>
      ) : (
        <div className="animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-8 bg-slate-50 p-2 rounded-3xl w-fit mx-auto border border-slate-100 shadow-sm">
            <div className="flex bg-slate-200/50 p-1 rounded-2xl">
              {["map", "list"].map((tab) => (
                <button key={tab} onClick={() => { setActiveTab(tab); setAddingStation(false); }}
                  className={`px-8 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === tab && !addingStation ? "bg-white text-cyan-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="hidden sm:block w-px h-6 bg-slate-200 mx-2"></div>
            <button onClick={() => setAddingStation(true)} 
              className={`px-8 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${addingStation ? "bg-slate-800 text-white" : "bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-100"}`}>
              Add Station
            </button>
          </div>

          <main>
            {addingStation ? (
              <AddStationForm onCancel={() => setAddingStation(false)} 
                onStationAdded={(s) => { setStations(prev => [s, ...prev]); setAddingStation(false); setActiveTab("list"); }} />
            ) : activeTab === "map" ? (
              <Map stations={filteredStations} isAdmin={isAdmin} onApprove={handleApprove} onDelete={handleDelete} onEdit={setEditingStation} />
            ) : (
              <StationList stations={filteredStations} isAdmin={isAdmin} onApprove={handleApprove} onDelete={handleDelete} onEdit={setEditingStation} />
            )
            }
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