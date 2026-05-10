import { useState, useEffect } from "react";

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    export function useStationFilters(initialStations, userLocation) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("distance");
    const [filters, setFilters] = useState({
        connector: "all",
        minPower: 0,
        operator: "all",
        maxPrice: 2.0,
        minRating: 0
    });

  const filteredStations = initialStations
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPower = Number(s.power) >= filters.minPower;
      const matchesConnector = filters.connector === "all" || s.connector_type === filters.connector;
      const matchesOperator = filters.operator === "all" || s.operator === filters.operator;
      const matchesPrice = parseFloat(s.price || 0) <= filters.maxPrice;
      const stationRating = Number(s.rating) || 0;
      const targetMinRating = Number(filters.minRating) || 0; 
      const matchesRating = stationRating >= targetMinRating;
      return matchesSearch && matchesPower && matchesConnector && matchesOperator && matchesPrice && matchesRating;
    })
    .map(s => ({
      ...s,
      distance: calculateDistance(userLocation?.lat, userLocation?.lng, s.latitude, s.longitude)
    }))
    .sort((a, b) => {
      if (sortBy === "distance") return a.distance - b.distance;
      if (sortBy === "power") return b.power - a.power;
      if (sortBy === "price") return parseFloat(a.price || 0) - parseFloat(b.price || 0);
      if (sortBy === "rating") {
        const ratingA = Number(a.rating) || 0;
        const ratingB = Number(b.rating) || 0;
        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }
        return a.distance - b.distance; 
      }
      return 0;
    });

  return { filteredStations, searchQuery, setSearchQuery, filters, setFilters, sortBy, setSortBy };
}