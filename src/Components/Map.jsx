import { useEffect, useRef, useState } from "react"; 
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"; 
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { useAuth } from "../Contexts/AuthContext.jsx";
import { calculateDistance } from "../Utils/geoUtils.jsx";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const mapTranslations = {
  "en": {
    clearRoute: "Clear route",
    youAreHere: "You are here",
    independentNetwork: "Independent Network",
    pendingApproval: "PENDING APPROVAL",
    plug: "Plug",
    power: "Power",
    price: "Price",
    distance: "Distance",
    free: "Free",
    showRoute: "Show route on Map",
    reviewHub: "Review & Photos Hub",
    editDetails: "Edit Station Details",
    approveStation: "Approve Station",
    deleteReject: "Delete / Reject",
    geoErrorNotSupported: "Geolocation is not supported by your browser.",
    geoErrorUnable: "Unable to retrieve location.",
  }, 
  "bg": {
    clearRoute: "Изчисти маршрут",
    youAreHere: "Вие сте тук",
    independentNetwork: "Независима мрежа",
    pendingApproval: "ОЧАКВА ОДОБРЕНИЕ",
    plug: "Конектор",
    power: "Мощност",
    price: "Цена",
    distance: "Разстояние",
    free: "Безплатно",
    showRoute: "Покажи маршрута на картата",
    reviewHub: "Ревюта и Снимки",
    editDetails: "Редактирай станцията",
    approveStation: "Одобри станцията",
    deleteReject: "Изтрий / Отхвърли",
    geoErrorNotSupported: "Геолокацията не се поддържа от вашия браузър.",
    geoErrorUnable: "Неуспешно извличане на местоположението."
  }
}

const userLocationIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <span class="absolute inline-flex h-7 w-7 rounded-full bg-cyan-500/30 scale-125 border border-cyan-400/50"></span>
      <div class="bg-slate-900 border-2 border-white p-2 rounded-full shadow-xl text-white flex items-center justify-center z-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      </div>
    </div>
  `,
  className: '', 
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

function RecenterMap({ coords }) {
  const map = useMap();
  const lastCoordsRef = useRef(null);

  useEffect(() => {
    if (!coords) return;
    
    if (lastCoordsRef.current) {
      const diff = calculateDistance(lastCoordsRef.current.lat, lastCoordsRef.current.lng, coords.lat, coords.lng);
      if (diff < 15) return; 
    }
    
    lastCoordsRef.current = coords;
    map.flyTo([coords.lat, coords.lng], 13, { animate: true, duration: 1.5 });
  }, [coords, map]);
  return null;
}

function RoutingMachine({ userCoords, destCoords }) {
  const map = useMap();
  const routingControlRef = useRef(null);
  const lastCalculatedUserCoordsRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    
    if (!userCoords || !destCoords) {
      if (routingControlRef.current) {
        try { map.removeControl(routingControlRef.current); } catch (e) {}
        routingControlRef.current = null;
      }
      lastCalculatedUserCoordsRef.current = null;
      return;
    }

    if (routingControlRef.current && lastCalculatedUserCoordsRef.current) {
      const distanceMoved = calculateDistance(
        lastCalculatedUserCoordsRef.current[0], 
        lastCalculatedUserCoordsRef.current[1], 
        userCoords[0], 
        userCoords[1]
      );
      
      if (distanceMoved < 15) {
        return; 
      }
    }

    if (routingControlRef.current) {
      try { map.removeControl(routingControlRef.current); } catch (e) {}
    }

    lastCalculatedUserCoordsRef.current = userCoords;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(userCoords[0], userCoords[1]), L.latLng(destCoords[0], destCoords[1])],
      lineOptions: { styles: [{ color: "#06b6d4", weight: 6, opacity: 0.8 }] },
      addWaypoints: false, 
      draggableWaypoints: false,
      routeWhileDragging: false,
      createMarker: () => L.marker([0, 0], { opacity: 0 }), 
      show: false,
      itineraryClassName: 'hidden' 
    });

    routingControlRef.current = routingControl;
    try { routingControl.addTo(map); } catch (e) { console.debug(e.message); }

    return () => {
      if (routingControlRef.current) {
        try { map.removeControl(routingControlRef.current); } catch (e) {}
        routingControlRef.current = null;
      }
    };
  }, [map, userCoords, destCoords]);

  return null;
}

export default function Map({ stations = [], isAdmin, onApprove, onDelete, onEdit, userLocation }) {
  const [activeRoute, setActiveRoute] = useState(null);
  const { lang } = useAuth();
  const t = mapTranslations[lang || "en"];

  // useEffect(() => {
  //   if (activeRoute && userLocation) {
  //     setActiveRoute(prev => {
  //       if (!prev) return null;
  //       return {
  //         ...prev,
  //         user: [userLocation.lat, userLocation.lng]
  //       };
  //     });
  //   }
  // }, [userLocation]);

  const handleGetDirections = (stationLat, stationLng) => {
    if (userLocation) {
      setActiveRoute({
        user: [userLocation.lat, userLocation.lng],
        dest: [stationLat, stationLng]
      });
    } else {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setActiveRoute({
            user: [position.coords.latitude, position.coords.longitude],
            dest: [stationLat, stationLng]
          });
        },
        () => alert("Unable to retrieve location.")
      );
    }
  };

  return (
    <div className="flex flex-col items-center mt-4 w-full relative">
      {activeRoute && (
        <button
          onClick={() => setActiveRoute(null)}
          className="absolute top-8 right-8 z-1000 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-full shadow-2xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          {t.clearRoute}
        </button>
      )}

      <MapContainer
        center={[42.7339, 25.4858]} 
        zoom={7} 
        className="w-full h-150 rounded-3xl border-4 border-white shadow-2xl mx-auto z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="http://osm.org/copyright">OpenStreetMap</a>'
        />

        <RecenterMap coords={userLocation} />

        {activeRoute && <RoutingMachine userCoords={activeRoute.user} destCoords={activeRoute.dest} />}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-cyan-500">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742c1.005-.717 2.186-1.654 3.122-2.696C18.44 17.548 20 15.461 20 12.5c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 2.961 1.56 5.048 2.33 6.417a16.951 16.951 0 004.068 3.435zM12 15a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                {t.youAreHere}
              </span>
            </Popup>
          </Marker>
        )}

        {stations.map((station) => {
          const hasPhotos = station.station_photos && station.station_photos.length > 0;
          const previewImageUrl = hasPhotos ? station.station_photos[0].image_url : null;

          return (
            <Marker key={station.id} position={[station.latitude, station.longitude]}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-45">
                  
                  {previewImageUrl && (
                    <div className="w-full h-24 mb-3 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                      <img src={previewImageUrl} alt={station.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="mb-2">
                    <div className="flex justify-between items-start gap-1">
                      <h3 className="text-lg font-black text-slate-900 leading-tight m-0">{station.name}</h3>
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 whitespace-nowrap">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                        {station.rating ? Number(station.rating).toFixed(1) : "0.0"}
                      </div>
                    </div>
                    <p className="text-xs font-bold text-cyan-600 uppercase tracking-wide m-0 italic">
                      {station.operator || "Independent Network"}
                    </p>
                  </div>

                  {isAdmin && !station.is_approved && (
                    <div className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded mb-2 border border-amber-100 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      {t.pendingApproval}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-3 border-t border-b border-slate-100 py-2">
                    <div>
                      <span className="text-slate-400 block uppercase font-bold">{t.plug}</span>
                      <span className="font-bold text-slate-700">{station.connector_type || "Type 2"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold">{t.power}</span>
                      <span className="font-bold text-slate-700">{station.power ? `${station.power} kW` : "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase font-bold">{t.price}</span>
                      <span className="font-bold text-emerald-600">{station.price ? `${station.price} euro/kWh` : "Free"}</span>
                    </div>
                    {station.distance && station.distance !== Infinity && (
                      <div>
                        <span className="text-slate-400 block uppercase font-bold">{t.distance}</span>
                        <span className="font-bold text-cyan-500">{station.distance.toFixed(1)} km</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 mb-3 italic">{station.address}</p>

                  <div className="mt-3 flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                    <button onClick={() => handleGetDirections(station.latitude, station.longitude)}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.281m5.94 2.28l-2.28 5.941" />
                      </svg>
                      {t.showRoute}
                    </button>

                    {!isAdmin && (
                      <button onClick={() => onEdit(station)}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white py-1.5 px-3 rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                       {t.reviewHub}
                      </button>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="mt-2 flex flex-col gap-1.5 pt-1.5">
                      <button onClick={() => onEdit(station)}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        {t.editDetails}
                      </button>
                      {!station.is_approved && (
                        <button onClick={() => onApprove(station.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-1 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t.approveStation}
                        </button>
                      )}
                      <button onClick={() => onDelete(station.id)}
                        className="bg-white hover:bg-rose-50 text-rose-500 border border-rose-100 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        {t.deleteReject}
                      </button>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}