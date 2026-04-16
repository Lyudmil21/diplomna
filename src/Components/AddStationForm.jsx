import { useState } from "react";
import { useAuth } from "../Contexts/AuthContext.jsx";
import { supabase } from "../Services/supabaseClient.jsx";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

export default function AddStationForm({ onCancel, onStationAdded }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [message, setMessage] = useState("");
  const [operator, setOperator] = useState("");
  const [power, setPower] = useState("");
  const [price, setPrice] = useState("");
  const [connector_type, setConnectorType] = useState("CCS");

  if (!user) return <p className="text-center py-10 text-slate-500 font-bold">You must be logged in to add a station.</p>;

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
      },
    });
    return latitude !== null ? <Marker position={[latitude, longitude]} /> : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !address || !latitude || !longitude) {
      setMessage("Please fill all fields and select location on the map.");
      return;
    }

    const { data, error } = await supabase.from("stations").insert([
      {
        name,
        address,
        latitude,
        longitude,
        operator,
        power,
        price,
        connector_type,
        added_by: user.id,
        is_approved: false
      },
    ]).select();

    if (error) {
      setMessage("Error adding station: " + error.message);
    } else {
      setMessage("Station submitted for approval!");
      if(onStationAdded && data) onStationAdded(data[0]);
      
      setName(""); setAddress(""); setLatitude(null); setLongitude(null);
      setOperator(""); setPower(""); setPrice("");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="flex-1 space-y-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add New Station</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600 ml-1">Station Name</label>
            <input 
              className="border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-400 outline-none transition-all" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Mall Plovdiv" 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600 ml-1">Address</label>
            <input className="border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-400 outline-none transition-all" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full street address" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600 ml-1">Operator</label>
            <select 
              className="border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-400 outline-none bg-white cursor-pointer font-medium"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            >
              <option value="">Select Operator</option>
              <option value="Eldrive">Eldrive</option>
              <option value="Fines">Fines</option>
              <option value="Tesla">Tesla</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600 ml-1">Connector Type</label>
            <select 
              className="border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-400 outline-none bg-white cursor-pointer font-medium"
              value={connector_type} 
              onChange={(e) => setConnectorType(e.target.value)}
            >
              <option value="CCS">CCS</option>
              <option value="Type 2">Type 2</option>
              <option value="CHAdeMO">CHAdeMO</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600 ml-1">Power (kW)</label>
            <input className="border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-400 outline-none transition-all" type="number" value={power} onChange={(e) => setPower(e.target.value)} placeholder="50" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600 ml-1">Price per kWh</label>
            <input className="border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-400 outline-none transition-all" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 0.60 BGN" />
          </div>
        </div>

        <div className="bg-cyan-50 p-4 rounded-2xl border border-cyan-100 mt-4">
          <p className="text-sm text-cyan-800 font-bold">Location Pick</p>
          <p className="text-xs font-mono text-cyan-600 mt-1">
            {latitude && longitude ? `📍 ${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : "Click somewhere on the map to set coordinates"}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-black uppercase py-3 px-6 rounded-2xl shadow-lg shadow-cyan-100 transition-all active:scale-95 cursor-pointer tracking-widest text-sm">
            Submit Station
          </button>
          <button type="button" onClick={onCancel} className="bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold py-3 px-6 rounded-2xl transition-all cursor-pointer text-sm">
            Cancel
          </button>
        </div>

        {message && (
          <p className={`mt-4 text-[10px] uppercase tracking-widest text-center font-black p-3 rounded-xl ${message.includes("Error") ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
            {message}
          </p>
        )}
      </form>

      <div className="flex-1 w-full min-h-87.5 h-87.5 lg:h-auto lg:min-h-full aspect-square lg:aspect-auto rounded-3xl overflow-hidden border-4 border-white shadow-2xl relative z-0">
        <MapContainer 
          center={[42.7339, 25.4858]} 
          zoom={7} 
          style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }} 
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
        </MapContainer>
      </div>
    </div>
  );
}