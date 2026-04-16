import { useState, useEffect } from "react";
import { supabase } from "../Services/supabaseClient.jsx";

export function useStationData(user, isAdmin) {
  const [stations, setStations] = useState([]);

  useEffect(() => {
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

  return { stations, setStations, handleApprove, handleDelete };
}