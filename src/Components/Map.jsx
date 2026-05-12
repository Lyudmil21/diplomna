import { useEffect, useRef, useState } from "react"; 
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"; 
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userLocationIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-slate-400 opacity-40"></span>
      <div class="bg-slate-900 border-2 border-white p-2 rounded-full shadow-xl text-white flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      </div>
    </div>
  `,
  className: '', 
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

function RoutingMachine({ userCoords, destCoords }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    if (!userCoords || !destCoords) {
      if (routingControlRef.current) {
        try { map.removeControl(routingControlRef.current); } catch (e) {}
        routingControlRef.current = null;
      }
      return;
    }
    if (routingControlRef.current) {
      try { map.removeControl(routingControlRef.current); } catch (e) {}
    }

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(userCoords[0], userCoords[1]), L.latLng(destCoords[0], destCoords[1])],
      lineOptions: { styles: [{ color: "#06b6d4", weight: 6, opacity: 0.8 }] },
      addWaypoints: false, 
      draggableWaypoints: false,
      routeWhileDragging: false,
      createMarker: () => null, 
      show: false 
    });

    routingControlRef.current = routingControl;
    try { routingControl.addTo(map); } catch (e) { console.debug(e.message); }

    return () => {
      if (routingControlRef.current) {
        try { map.removeControl(routingControlRef.current); } catch (e) {}
        routingControlRef.current = null;
      }
    };
  }, [map, userCoords, destCoords]);

  return null;
}

export default function Map({ stations = [], isAdmin, onApprove, onDelete, onEdit }) {
  const [activeRoute, setActiveRoute] = useState(null);

  const handleGetDirections = (stationLat, stationLng) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setActiveRoute({
          user: [position.coords.latitude, position.coords.longitude],
          dest: [stationLat, stationLng]
        });
      },
      () => alert("Unable to retrieve location.")
    );
  };

  return (
    <div className="flex flex-col items-center mt-4 w-full relative">
      {activeRoute && (
        <button
          onClick={() => setActiveRoute(null)}
          className="absolute top-8 right-8 z-1000 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-full shadow-2xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          Clear Route
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

        {activeRoute && <RoutingMachine userCoords={activeRoute.user} destCoords={activeRoute.dest} />}

        {activeRoute && (
          <Marker position={activeRoute.user} icon={userLocationIcon}>
            <Popup><span className="font-bold text-xs text-slate-800">You are here 📍</span></Popup>
          </Marker>
        )}

        {stations.map((station) => (
          <Marker key={station.id} position={[station.latitude, station.longitude]}>
            <Popup className="custom-popup">
              <div className="p-1 min-w-45">
                <div className="mb-2">
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="text-lg font-black text-slate-900 leading-tight m-0">{station.name}</h3>
                    <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 whitespace-nowrap">
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
                    <span className="font-bold text-emerald-600">{station.price ? `${station.price} euro/kWh` : "Free"}</span>
                  </div>
                  {station.distance && station.distance !== Infinity && (
                    <div>
                      <span className="text-slate-400 block uppercase font-bold">Distance</span>
                      <span className="font-bold text-cyan-500">{station.distance.toFixed(1)} km</span>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-500 mb-3 italic">{station.address}</p>

                <div className="mt-3 flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                  <button onClick={() => handleGetDirections(station.latitude, station.longitude)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold shadow-sm flex items-center justify-center cursor-pointer">
                    Show Route on Map
                  </button>

                  {!isAdmin && (
                    <button onClick={() => onEdit(station)}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white py-1.5 px-3 rounded-lg text-xs font-bold shadow-sm flex items-center justify-center cursor-pointer">
                      Review & Suggest Edit
                    </button>
                  )}
                </div>

                {isAdmin && (
                  <div className="mt-2 flex flex-col gap-1.5 pt-1.5">
                    <button onClick={() => onEdit(station)}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer">
                      Edit Station Details
                    </button>
                    {!station.is_approved && (
                      <button onClick={() => onApprove(station.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold shadow-sm cursor-pointer">
                      Approve Station
                      </button>
                    )}
                    <button onClick={() => onDelete(station.id)}
                      className="bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 py-1.5 px-3 rounded-lg text-xs font-bold cursor-pointer">
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