import { useState, useEffect } from "react";
import { supabase } from "../Services/supabaseClient.jsx"; 

export default function EditStationModal({ station, onClose, onUpdate, isAdmin }) {
  const [formData, setFormData] = useState({
    name: station.name || "",
    operator: station.operator || "",
    price: station.price || "",
    power: station.power || "",
  });
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [existingReviews, setExistingReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [stationPhotos, setStationPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    const fetchReviewsAndPhotos = async () => {
      setLoadingReviews(true);
      setLoadingPhotos(true);
      
      try {
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("id, rating, comment, created_at, user_id")
          .eq("station_id", station.id)
          .order("created_at", { ascending: false });

        if (!reviewsError) {
          setExistingReviews(reviewsData || []);
        }

        const { data: photosData, error: photosError } = await supabase
          .from("station_photos")
          .select("id, image_url, created_at")
          .eq("station_id", station.id)
          .order("created_at", { ascending: false });

        if (!photosError) {
          setStationPhotos(photosData || []);
        }
      } catch (err) {
        console.error("Error fetching modal dashboard data:", err);
      } finally {
        setLoadingReviews(false);
        setLoadingPhotos(false);
      }
    };

    fetchReviewsAndPhotos();
  }, [station.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadMessage("Uploading image...");

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${station.id}/${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from("station-photos")
        .upload(filePath, selectedFile);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from("station-photos")
        .getPublicUrl(filePath);

      const { data: newPhotoRow, error: dbError } = await supabase
        .from("station_photos")
        .insert([
          {
            station_id: station.id,
            image_url: publicUrl
          }
        ])
        .select();

      if (dbError) throw dbError;

      setUploadMessage("✅ Photo uploaded successfully!");
      setSelectedFile(null);
      
      if (newPhotoRow && newPhotoRow[0]) {
        setStationPhotos((prev) => [newPhotoRow[0], ...prev]);
      }
      
      const inputElement = document.getElementById("station-photo-uploader");
      if (inputElement) inputElement.value = "";

    } catch (error) {
      console.error("Image upload exception thrown:", error.message);
      setUploadMessage(`❌ Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
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
          <h3 className="text-xl font-black tracking-tight w-full px-6 flex items-center justify-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-cyan-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.015 9.015 0 0 1 8.716 6.747M12 3a9.015 9.015 0 0 0-8.716 6.747M12 9h.008v.008H12V9Zm6 3h.008v.008H18V12Zm-12 0h.008v.008H6V12Zm6 3h.008v.008H12V15Z" />
            </svg>
            Station Hub
          </h3>
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
          
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5A1.5 1.5 0 0 0 22 18V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              Station Photos ({stationPhotos.length})
            </h4>

            {loadingPhotos ? (
              <p className="text-xs font-bold text-slate-400 animate-pulse py-1">Loading gallery layout...</p>
            ) : stationPhotos.length === 0 ? (
              <div className="text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs font-medium text-slate-400 italic">No photos shared for this charger yet.</p>
              </div>
            ) : (
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin max-w-full snap-x">
                {stationPhotos.map((photo) => (
                  <div key={photo.id} className="relative shrink-0 snap-center rounded-xl overflow-hidden border border-slate-100 group shadow-sm bg-slate-50">
                    <img 
                      src={photo.image_url} 
                      alt="EV Station Community" 
                      className="w-24 h-24 object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
              Upload New Station Photo
            </label>
            
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input 
                id="station-photo-uploader"
                type="file" 
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer text-slate-500 w-full"
              />
              
              {selectedFile && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handlePhotoUpload}
                  className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-md shadow-cyan-100 shrink-0 cursor-pointer flex items-center justify-center"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              )}
            </div>

            {uploadMessage && (
              <p className="text-[10px] font-bold mt-1.5 text-slate-500 italic">
                {uploadMessage}
              </p>
            )}
          </div>

          <div className="w-full h-px bg-slate-100"></div>

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
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Price (euro/kWh)</label>
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
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 text-center items-center justify-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-amber-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.173-.434.768-.434.94 0l3.102 6.312 6.965 1.013c.493.071.693.686.337 1.036l-5.04 4.912 1.19 6.936c.088.514-.452.905-.902.663L12 19.184l-6.213 3.29c-.45.242-.99-.149-.902-.663l1.19-6.936-5.04-4.912c-.356-.35-.155-.965.337-1.036l6.965-1.013 3.102-6.312Z" />
                </svg>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className={`w-7 h-7 transition-colors duration-150 ${
                        (hoverRating || rating) >= star 
                          ? "fill-amber-400 text-amber-400" 
                          : "fill-none text-slate-300 stroke-[2.5]"
                      }`}
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
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
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
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
                      <div className="text-amber-400 text-xs tracking-tight font-sans">
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