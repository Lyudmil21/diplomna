import { useState, useEffect } from "react";
import { calculateDistance } from "../../Utils/geoUtils.jsx";

export function useStationFilters(initialStations, initialUserLocation) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [isTracking, setIsTracking] = useState(false);
  const [liveLocation, setLiveLocation] = useState(initialUserLocation);
  const [highAccuracy, setHighAccuracy] = useState(true);

  const [filters, setFilters] = useState({
    connector: "all",
    minPower: 0,
    operator: "all",
    maxPrice: 2.0,
    minRating: 0
  });

  useEffect(() => {
    if (!isTracking) return;

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setIsTracking(false);
      return;
    }

    let watchId;

    const startWatching = (useHighAccuracy) => {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLiveLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching location:", error);
          
          if ((error.code === 3 || error.code === 2) && useHighAccuracy) {
            console.warn("High accuracy failed. Downgrading to low accuracy mode...");
            setHighAccuracy(false); 
            navigator.geolocation.clearWatch(watchId); 
            startWatching(false); 
          }
        },
        {
          enableHighAccuracy: useHighAccuracy, 
          maximumAge: useHighAccuracy ? 0 : 10000, 
          timeout: useHighAccuracy ? 6000 : 15000, 
        }
      );
    };

    startWatching(highAccuracy);

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, highAccuracy]);

  useEffect(() => {
    if (!isTracking) {
      setHighAccuracy(true);
    }
  }, [isTracking]);

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
      distance: calculateDistance(liveLocation?.lat, liveLocation?.lng, s.latitude, s.longitude)
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

  return { filteredStations, searchQuery, setSearchQuery, filters, setFilters, sortBy, setSortBy, isTracking, setIsTracking, liveLocation };
}