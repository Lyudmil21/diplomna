import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Map({ stations = [], isAdmin, onApprove, onDelete }) {
  return (
    <div className="flex justify-center mt-4">
      <MapContainer
        center={[42.7339, 25.4858]} 
        zoom={7} 
        className="w-full h-150 rounded-3xl border-4 border-white shadow-2xl mx-auto z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        />

        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-45">
                <div className="mb-2">
                  <h3 className="text-lg font-black text-slate-900 leading-tight m-0">{station.name}</h3>
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