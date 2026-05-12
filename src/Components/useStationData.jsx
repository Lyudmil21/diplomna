import { useState, useEffect } from "react";
import { supabase } from "../Services/supabaseClient.jsx";

export function useStationData(user, isAdmin, authLoading) {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    const fetchStations = async () => {
      let query = supabase.from("stations").select("*");
      if (!isAdmin) query = query.eq("is_approved", true);
      const { data, error } = await query;
      if (!error) setStations(data || []);
    };
    fetchStations();
  }, [isAdmin, user, authLoading]);

  const handleApprove = async (id) => {
    const { error } = await supabase.from("stations").update({ is_approved: true }).eq("id", id);
    if (!error) setStations(prev => prev.map(s => s.id === id ? { ...s, is_approved: true } : s));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    const { error } = await supabase.from("stations").delete().eq("id", id);
    if (!error) setStations(prev => prev.filter(s => s.id !== id));
  };

  const handleStationUpdateOrSuggest = async (stationId, updatePayload) => {
    const { name, operator, price, power, newReview } = updatePayload;

    const parsedPrice = price ? parseFloat(price) : null;
    const parsedPower = power ? parseInt(power, 10) : null;

    try {
      if (isAdmin) {
        const { error: stationError } = await supabase
          .from("stations")
          .update({
            name,
            operator: operator || null,
            price: parsedPrice, 
            power: parsedPower, 
            updated_by: user?.id
          })
          .eq("id", stationId);

        if (stationError) throw stationError;

        setStations(prev => prev.map(s => s.id === stationId ? { 
          ...s, name, operator, price: parsedPrice, power: parsedPower, updated_by: user?.id 
        } : s));
      } else {
        const { error: suggestionError } = await supabase
          .from("station_edits")
          .insert({
            station_id: stationId,
            suggested_by: user?.id,
            new_data: { name, operator, price: parsedPrice, power: parsedPower } 
          });

        if (suggestionError) throw suggestionError;
        alert("Changes submitted for approval by administration!");
      }

      if (newReview && newReview.rating > 0) {
        const { error: reviewError } = await supabase
          .from("reviews")
          .insert({
            station_id: stationId,
            user_id: user?.id,
            rating: newReview.rating,
            comment: newReview.comment || null
          });

        if (reviewError) throw reviewError;

        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("rating")
          .eq("station_id", stationId);

        if (reviewsData && reviewsData.length > 0) {
          const totalScore = reviewsData.reduce((sum, r) => sum + r.rating, 0);
          const averageRating = parseFloat((totalScore / reviewsData.length).toFixed(1));

          await supabase
            .from("stations")
            .update({ rating: averageRating })
            .eq("id", stationId);

          setStations(prev => prev.map(s => s.id === stationId ? { 
            ...s, 
            ...(isAdmin ? { name, operator, price: parsedPrice, power: parsedPower } : {}), 
            rating: averageRating 
          } : s));
        }
      }

      return { success: true };
    } catch (err) {
      console.error("Transaction processing failure:", err);
      alert("An error occurred while saving your data.");
      return { success: false };
    }
  };

  return { stations, setStations, handleApprove, handleDelete, handleStationUpdateOrSuggest };
}