import { useState } from "react";

export default function EditStationModal({ station, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: station.name || "",
    operator: station.operator || "",
    price: station.price || "",
    power: station.power || "",
    rating: station.rating || "0.0",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Station name is required.");
    
    setIsSaving(true);
    const result = await onUpdate(station.id, formData);
    setIsSaving(false);
    
    if (result?.success) {
      onClose(); 
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition-all animate-in zoom-in-95 duration-200">
        
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight">Edit Station Details</h3>
            <p className="text-slate-400 text-xs mt-0.5">Modify parameters for current station node</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Station Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-bold text-slate-800 text-sm" />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Network Operator</label>
            <input type="text" name="operator" value={formData.operator} onChange={handleChange} placeholder="Independent"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-bold text-slate-800 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Price (lv/kWh)</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder="Free"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-bold text-slate-800 text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Power Output (kW)</label>
              <input type="number" name="power" value={formData.power} onChange={handleChange} placeholder="N/A"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-bold text-slate-800 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Star Rating (0.0 - 5.0)</label>
            <input type="number" step="0.1" min="0" max="5" name="rating" value={formData.rating} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-bold text-slate-800 text-sm" />
          </div>

          <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={isSaving}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase py-3 rounded-xl tracking-wider transition-all cursor-pointer disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isSaving}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs uppercase py-3 rounded-xl tracking-wider shadow-md shadow-cyan-100 transition-all cursor-pointer disabled:opacity-50">
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}