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
  }, [isAdmin, user]);

  const handleApprove = async (id) => {
    const { error } = await supabase.from("stations").update({ is_approved: true }).eq("id", id);
    if (!error) setStations(prev => prev.map(s => s.id === id ? { ...s, is_approved: true } : s));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    const { error } = await supabase.from("stations").delete().eq("id", id);
    if (!error) setStations(prev => prev.filter(s => s.id !== id));
  };

  const handleAdminUpdate = async (stationId, updatedFields) => {
  try {
    const { error } = await supabase
      .from("stations")
      .update({
        name: updatedFields.name,
        operator: updatedFields.operator || null,
        price: updatedFields.price ? parseFloat(updatedFields.price) : null,
        power: updatedFields.power ? parseInt(updatedFields.power, 10) : null,
        rating: updatedFields.rating ? parseFloat(updatedFields.rating) : 0.0
      })
      .eq("id", stationId);

    if (error) throw error;

    setStations(prev => prev.map(s => s.id === stationId ? { ...s, ...updatedFields } : s));
    return { success: true };
  } catch (err) {
    console.error(err);
    alert("Failed updating database record.");
    return { success: false };
  }
};

  return { stations, setStations, handleApprove, handleDelete, handleAdminUpdate };
}