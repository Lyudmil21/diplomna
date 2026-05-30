import { useState, useEffect } from "react";
import { supabase } from "../Services/supabaseClient.jsx"; 
import { useAuth } from "../Contexts/AuthContext.jsx"; 

const modalTranslations = {
  en: {
    hubTitle: "Station Hub",
    hubSubtitle: "View details, submit suggestions, or leave a review",
    sectionPhotos: "Station Photos",
    loadingLayout: "Loading gallery layout...",
    noPhotos: "No photos shared for this charger yet.",
    deleteConfirm: "Are you sure you want to delete this station photo?",
    deleteSuccess: "Photo deleted successfully.",
    deleteFail: "Failed to delete photo:",
    uploadLabel: "Upload New Station Photo",
    uploadingMsg: "Uploading image...",
    uploadSuccess: "Photo uploaded successfully!",
    uploadFail: "Upload failed:",
    btnUploading: "Uploading...",
    btnUpload: "Upload",
    labelName: "Station Name",
    labelOperator: "Network Operator",
    placeholderOperator: "Independent",
    labelPrice: "Price (euro/kWh)",
    placeholderFree: "Free",
    labelPower: "Power Output (kW)",
    placeholderNA: "N/A",
    reviewLabel: "Leave your Review",
    reviewPlaceholder: "Share your charging experience at this location...",
    btnCancel: "Cancel",
    btnSaving: "Saving...",
    btnPublish: "Publish Changes",
    btnSuggest: "Submit Suggestion",
    sectionReviews: "Community Reviews",
    loadingReviews: "Loading reviews...",
    noReviews: "No reviews left for this station yet.",
    emptyReviewMsg: "User rated this station without leaving a comment.",
    nameRequired: "Station name is required."
  },

  bg: {
    hubTitle: "Център за станции",
    hubSubtitle: "Преглед на подробности, изпращане на предложения или отзив",
    sectionPhotos: "Снимки на станцията",
    loadingLayout: "Зареждане на галерията...",
    noPhotos: "Все още няма качени снимки за тази станция.",
    deleteConfirm: "Наистина ли искате да изтриете тази снимка?",
    deleteSuccess: "Снимката е изтрита успешно.",
    deleteFail: "Неуспешно изтриване на снимката:",
    uploadLabel: "Качи нова снимка на станцията",
    uploadingMsg: "Качване на изображението...",
    uploadSuccess: "Снимката е качена успешно!",
    uploadFail: "Качването се провали:",
    btnUploading: "Качване...",
    btnUpload: "Качи",
    labelName: "Име на станцията",
    labelOperator: "Зарядна мрежа / Оператор",
    placeholderOperator: "Независим",
    labelPrice: "Цена (евро/kWh)",
    placeholderFree: "Безплатно",
    labelPower: "Мощност (kW)",
    placeholderNA: "N/A",
    reviewLabel: "Оставете вашия отзив",
    reviewPlaceholder: "Споделете опита си с зареждането на тази локация...",
    btnCancel: "Отказ",
    btnSaving: "Запазване...",
    btnPublish: "Публикувай",
    btnSuggest: "Изпрати предложение",
    sectionReviews: "Потребителски отзиви",
    loadingReviews: "Зареждане на отзиви...",
    noReviews: "Все още няма отзиви за тази станция.",
    emptyReviewMsg: "Потребителят е оценил станцията без да остави коментар.",
    nameRequired: "Името на станцията е задължително."
  }
};

export default function EditStationModal({ station, onClose, onUpdate, isAdmin }) {
  const { user, lang } = useAuth();
  const t = modalTranslations[lang || "en"];

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
        console.error("Error fetching modal data:", err);
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
      setUploadMessage(t.uploadingMsg);

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

      setUploadMessage(t.uploadSuccess);
      setSelectedFile(null);
      
      if (newPhotoRow && newPhotoRow[0]) {
        setStationPhotos((prev) => [newPhotoRow[0], ...prev]);
      }
      
      const inputElement = document.getElementById("station-photo-uploader");
      if (inputElement) inputElement.value = "";

    } catch (error) {
      console.error("Image upload error:", error.message);
      setUploadMessage(`${t.uploadFail} ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId, imageUrl) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      const pathParts = imageUrl.split('/storage/v1/object/public/station-photos/');
      if (pathParts.length < 2) throw new Error("Could not parse file path from storage URL.");
      const storageFilePath = pathParts[1];

      const { error: storageDeleteError } = await supabase.storage
        .from("station-photos")
        .remove([storageFilePath]);

      if (storageDeleteError) throw storageDeleteError;

      const { error: dbDeleteError } = await supabase
        .from("station_photos")
        .delete()
        .eq("id", photoId);

      if (dbDeleteError) throw dbDeleteError;

      setStationPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
      alert(t.deleteSuccess);

    } catch (error) {
      console.error("Error removing station photo:", error.message);
      alert(`${t.deleteFail} ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert(t.nameRequired);
    
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
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            {t.hubTitle}
          </h3>
          <p className="text-slate-400 text-xs mt-0.5 w-full px-6">{t.hubSubtitle}</p>
          
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
              {t.sectionPhotos} ({stationPhotos.length})
            </h4>

            {loadingPhotos ? (
              <p className="text-xs font-bold text-slate-400 animate-pulse py-1">{t.loadingLayout}</p>
            ) : stationPhotos.length === 0 ? (
              <div className="text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-xs font-medium text-slate-400 italic">{t.noPhotos}</p>
              </div>
            ) : (
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin max-w-full snap-x">
                {stationPhotos.map((photo) => (
                  <div key={photo.id} className="relative shrink-0 snap-center rounded-xl overflow-hidden border border-slate-100 group shadow-sm bg-slate-50 w-24 h-24">
                    <img 
                      src={photo.image_url} 
                      alt="EV Station Community" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(photo.id, photo.image_url)}
                        className="absolute top-1 right-1 bg-rose-500/90 hover:bg-rose-600 text-white p-1 rounded-lg transition-colors cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shadow-md"
                        title="Delete photo as Admin"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {t.uploadLabel}
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
                  className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-md shadow-cyan-100 shrink-0 cursor-pointer flex items-center justify-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  {uploading ? t.btnUploading : t.btnUpload}
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
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{t.labelName}</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-bold text-slate-800 text-sm" />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{t.labelOperator}</label>
              <input type="text" name="operator" value={formData.operator} onChange={handleChange} placeholder={t.placeholderOperator}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-bold text-slate-800 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{t.labelPrice}</label>
                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} placeholder={t.placeholderFree}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-bold text-slate-800 text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{t.labelPower}</label>
                <input type="number" name="power" value={formData.power} onChange={handleChange} placeholder={t.placeholderNA}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-bold text-slate-800 text-sm" />
              </div>
            </div>

            <div className="w-full h-px bg-slate-100 my-1"></div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 text-center flex items-center justify-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5 text-cyan-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379L12 21l2.62-2.636c1.152-.086 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                {t.reviewLabel}
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
                  placeholder={t.reviewPlaceholder}
                  rows="2"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium text-slate-700 text-xs resize-none bg-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={onClose} disabled={isSaving}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase py-3 rounded-xl tracking-wider transition-all cursor-pointer disabled:opacity-50">
                {t.btnCancel}
              </button>
              <button type="submit" disabled={isSaving}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-black text-xs uppercase py-3 rounded-xl tracking-wider shadow-md shadow-cyan-100 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {isSaving ? t.btnSaving : isAdmin ? t.btnPublish : t.btnSuggest}
              </button>
            </div>
          </form>

          <div className="w-full h-px bg-slate-100"></div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
              {t.sectionReviews} ({existingReviews.length})
            </h4>

            {loadingReviews ? (
              <p className="text-xs font-bold text-slate-400 animate-pulse py-2">{t.loadingReviews}</p>
            ) : existingReviews.length === 0 ? (
              <p className="text-xs font-medium text-slate-400 italic py-2">{t.noReviews}</p>
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
                        {t.emptyReviewMsg}
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