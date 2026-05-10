import { useEffect, useRef, useState } from "react"; 
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"; 
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { supabase } from "../Services/supabaseClient.jsx";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for your live location marker
const userLocationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2991/2991195.png', 
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

function RoutingMachine({ userCoords, destCoords }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (!userCoords || !destCoords) {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {
          console.debug("Cleared route safely");
        }
        routingControlRef.current = null;
      }
      return;
    }

    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (e) {
        console.debug("Cleared route safely");
      }
    }

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userCoords[0], userCoords[1]), 
        L.latLng(destCoords[0], destCoords[1])  
      ],
      lineOptions: {
        styles: [{ color: "#06b6d4", weight: 6, opacity: 0.8 }] 
      },
      addWaypoints: false, 
      draggableWaypoints: false,
      routeWhileDragging: false,
      createMarker: () => null, 
      show: false 
    });

    routingControlRef.current = routingControl;

    try {
      routingControl.addTo(map);
    } catch (e) {
      console.debug("Failed to add routing control:", e.message);
    }

    return () => {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {
          // Ignore
        }
        routingControlRef.current = null;
      }
    };
  }, [map, userCoords, destCoords]);

  return null;
}

export default function Map({ stations = [], isAdmin, onApprove, onDelete }) {
  const [activeRoute, setActiveRoute] = useState(null);

  const handleGetDirections = (stationLat, stationLng) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        setActiveRoute({
          user: [userLat, userLng],
          dest: [stationLat, stationLng]
        });
      },
      (error) => {
        alert("Unable to retrieve your location. Please allow location access.");
      }
    );
  };

  const handleSuggestEdit = async (station) => {
    const newPrice = prompt(`Suggest a new price for ${station.name} (Current: ${station.price || 'Free'}):`, station.price || '');
    if (newPrice === null) return;

    const newConnectors = prompt(`Suggest connectors changes (Current: ${station.connector_type || 'Type 2'}):`, station.connector_type || '');
    if (newConnectors === null) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('station_edits')
        .insert([
          {
            station_id: station.id,
            suggested_by: user?.id || null,
            new_data: { price: newPrice, connector_type: newConnectors },
            status: 'pending'
          }
        ]);

      if (error) throw error;
      alert("Success! Your suggested changes have been queued for administrative review.");
    } catch (err) {
      console.error(err);
      alert("Could not submit suggestion. Make sure you are logged in!");
    }
  };

  return (
    <div className="flex flex-col items-center mt-4 w-full relative">
      
      {activeRoute && (
        <button
          onClick={() => setActiveRoute(null)}
          className="absolute top-8 right-8 z-1000 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-full shadow-2xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          ❌ Clear Route
        </button>
      )}

      <MapContainer
        center={[42.7339, 25.4858]} 
        zoom={7} 
        className="w-full h-150 rounded-3xl border-4 border-white shadow-2xl mx-auto z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="http://osm.org/copyright">OpenStreetMap</a>'
        />

        {activeRoute && (
          <RoutingMachine 
            userCoords={activeRoute ? activeRoute.user : null} 
            destCoords={activeRoute ? activeRoute.dest : null}
          />
        )}

        {activeRoute && (
          <Marker position={activeRoute.user} icon={userLocationIcon}>
            <Popup>
              <span className="font-bold text-xs text-slate-800">You are here 📍</span>
            </Popup>
          </Marker>
        )}

        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-45">
                <div className="mb-2">
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="text-lg font-black text-slate-900 leading-tight m-0">{station.name}</h3>
                    <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                      ⭐ {station.rating ? Number(station.rating).toFixed(1) : "0.0"}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-cyan-600 uppercase tracking-wide m-0 italic">
                    {station.operator || "Independent Network"}
                  </p>
                </div>

                {isAdmin && !station.is_approved && (
                  <div className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded mb-2 border border-amber-100 flex items-center gap-1">
                    <span>⚠️</span> PENDING APPROVAL
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 border-t border-b border-slate-100 py-2">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold">Plug</span>
                    <span className="font-bold text-slate-700">{station.connector_type || "Type 2"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold">Power</span>
                    <span className="font-bold text-slate-700">{station.power ? `${station.power} kW` : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold">Price</span>
                    <span className="font-bold text-emerald-600">{station.price ? `${station.price} lv/kWh` : "Free"}</span>
                  </div>
                  {station.distance && station.distance !== Infinity && (
                    <div>
                      <span className="text-slate-400 block uppercase font-bold">Distance</span>
                      <span className="font-bold text-cyan-500">{station.distance.toFixed(1)} km</span>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-500 mb-3 italic">
                  {station.address}
                </p>

                <div className="mt-3 flex flex-col gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleGetDirections(station.latitude, station.longitude)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Show Route on Map
                  </button>

                  {!isAdmin && (
                    <button
                      onClick={() => handleSuggestEdit(station)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-1 px-3 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Suggest an Edit
                    </button>
                  )}
                </div>

                {isAdmin && (
                  <div className="mt-3 flex flex-col gap-2 pt-2 border-t border-slate-100">
                    {!station.is_approved && (
                      <button
                        onClick={() => onApprove(station.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        Approve Station
                      </button>
                    )}
                    
                    <button
                      onClick={() => onDelete(station.id)}
                      className="bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      Delete / Reject
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}