import { useState, useEffect } from "react";
import { supabase } from "../Services/supabaseClient.jsx"; 

export default function EditStationModal({ station, onClose, onUpdate, isAdmin }) {
  const [formData, setFormData] = useState({
    name: station.name || "",
    operator: station.operator || "",
    price: station.price || "",
    power: station.power || "",
  });
  
  // Review Engine Local States
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [existingReviews, setExistingReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // ✨ NEW: Fetch reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("id, rating, comment, created_at, user_id")
          .eq("station_id", station.id)
          .order("created_at", { ascending: false });

        if (!error) {
          setExistingReviews(data || []);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [station.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Station name is required.");
    
    setIsSaving(true);

    const updatePayload = {
      ...formData,
      newReview: rating > 0 ? {
        rating,
        comment: comment.trim() || null
      } : null
    };

    const result = await onUpdate(station.id, updatePayload);
    setIsSaving(false);
    
    if (result?.success) {
      onClose(); 
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-9999 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition-all animate-in zoom-in-95 duration-200">
        
        <div className="p-6 bg-slate-900 text-white relative flex flex-col items-center text-center">
          <h3 className="text-xl font-black tracking-tight w-full px-6">Station Hub</h3>
          <p className="text-slate-400 text-xs mt-0.5 w-full px-6">View details, submit suggestions, or leave a review</p>
          
          <button 
            type="button"
            onClick={onClose} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/50 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6 flex flex-col gap-5">
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

            <div className="w-full h-px bg-slate-100 my-1"></div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 text-center">
                Leave your Review
              </label>
              
              <div className="flex items-center justify-center gap-1.5 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform active:scale-95 cursor-pointer text-2xl focus:outline-none"
                  >
                    <span className={`transition-colors duration-150 ${(hoverRating || rating) >= star ? "text-amber-400" : "text-slate-200"}`}>
                      ★
                    </span>
                  </button>
                ))}
              </div>

              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your charging experience at this location..."
                  rows="2"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium text-slate-700 text-xs resize-none bg-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} disabled={isSaving}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase py-3 rounded-xl tracking-wider transition-all cursor-pointer disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={isSaving}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs uppercase py-3 rounded-xl tracking-wider shadow-md shadow-cyan-100 transition-all cursor-pointer disabled:opacity-50">
                {isSaving ? "Saving..." : isAdmin ? "Publish Changes" : "Submit Suggestion & Review"}
              </button>
            </div>
          </form>

          <div className="w-full h-px bg-slate-100"></div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
              Community Reviews ({existingReviews.length})
            </h4>

            {loadingReviews ? (
              <p className="text-xs font-bold text-slate-400 animate-pulse py-2">Loading reviews...</p>
            ) : existingReviews.length === 0 ? (
              <p className="text-xs font-medium text-slate-400 italic py-2">No reviews left for this station yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {existingReviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="text-amber-400 text-sm tracking-tight">
                        {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {rev.comment ? (
                      <p className="text-slate-600 font-medium text-xs leading-relaxed mt-0.5">
                        "{rev.comment}"
                      </p>
                    ) : (
                      <p className="text-slate-400 italic text-[11px] mt-0.5">
                        User rated this station without leaving a comment.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}