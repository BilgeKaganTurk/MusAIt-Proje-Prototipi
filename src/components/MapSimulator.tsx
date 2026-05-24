import React, { useState, useEffect } from 'react';
import { Coins, Navigation, Car, X, Search, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { MapSpot, ParkingSpot } from '../types';

interface MapSimulatorProps {
  activeSpots: ParkingSpot[];
}

const createIcon = (status: 'green' | 'yellow' | 'expired', isOrigin = false, rotation = 0) => {
  const bgColor = isOrigin ? '#3b82f6' : status === 'green' ? '#10b981' : '#f59e0b';
  const iconHtml = renderToString(
    <div style={{
      backgroundColor: bgColor,
      padding: '4px',
      borderRadius: '50%',
      border: '2px solid white',
      boxShadow: '0 0 15px rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      transform: `rotate(${rotation}deg)`,
      transition: 'transform 0.5s ease-in-out'
    }}>
      {isOrigin ? <Navigation size={14} color="white" /> : <MapPin size={14} color="white" />}
    </div>
  );

  return L.divIcon({
    className: 'bg-transparent',
    html: iconHtml,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const getMemoizedIcon = (() => {
  const cache = new Map<string, L.DivIcon>();
  return (status: 'green' | 'yellow' | 'expired', isOrigin = false, rotation = 0) => {
    const key = `${status}-${isOrigin}-${rotation}`;
    if (!cache.has(key)) {
      cache.set(key, createIcon(status, isOrigin, rotation));
    }
    return cache.get(key)!;
  };
})();

const mockOrigin = { lat: 40.9904, lng: 29.0292 };

function RouteDisplay({ origin, destination, onRouteFetched }: {
  origin: { lat: number, lng: number };
  destination: { lat: number, lng: number } | null;
  onRouteFetched: (distance: number, duration: number, bearing: number) => void;
}) {
  const map = useMap();
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  
  // Use ref to keep latest callback without triggering effect
  const onRouteFetchedRef = React.useRef(onRouteFetched);
  React.useEffect(() => {
    onRouteFetchedRef.current = onRouteFetched;
  }, [onRouteFetched]);

  useEffect(() => {
    if (!destination) {
      setRouteCoords([]);
      onRouteFetchedRef.current(0, 0, 0);
      return;
    }
    
    const dLat = destination.lat;
    const dLng = destination.lng;
    const oLat = origin.lat;
    const oLng = origin.lng;

    async function fetchRoute() {
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
          setRouteCoords(coords);
          
          let brng = 0;
          if (coords.length > 1) {
             const [lat1, lng1] = coords[0];
             const [lat2, lng2] = coords[1];
             const dLngRad = ((lng2 - lng1) * Math.PI) / 180;
             const lat1Rad = (lat1 * Math.PI) / 180;
             const lat2Rad = (lat2 * Math.PI) / 180;
             const y = Math.sin(dLngRad) * Math.cos(lat2Rad);
             const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLngRad);
             brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
          }

          onRouteFetchedRef.current(data.routes[0].distance, data.routes[0].duration, brng);
          
          // Harita navigasyon moduna geçtiğinde başlangıç noktasına yoğunlaşıyoruz.
          map.flyTo([oLat, oLng], 17, { animate: true, duration: 1.5 });
        } else {
          setRouteCoords([[oLat, oLng], [dLat, dLng]]);
          map.flyTo([oLat, oLng], 17, { animate: true, duration: 1.5 });
        }
      } catch (err) {
        setRouteCoords([[oLat, oLng], [dLat, dLng]]);
        map.flyTo([oLat, oLng], 17, { animate: true, duration: 1.5 });
      }
    }
    
    fetchRoute();
  }, [destination?.lat, destination?.lng, origin.lat, origin.lng, map]);

  const pathOptions = React.useMemo(() => ({ color: '#10b981', weight: 6, opacity: 0.9 }), []);

  if (!destination || routeCoords.length === 0) return null;
  return (
    <Polyline 
      positions={routeCoords} 
      pathOptions={pathOptions} 
    />
  );
}

export function MapSimulator({ activeSpots }: MapSimulatorProps) {
  const [simulatedSpots, setSimulatedSpots] = useState<ParkingSpot[]>([]);
  const [spotsWithStatus, setSpotsWithStatus] = useState<MapSpot[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('sedan');
  const [activeRouteDestination, setActiveRouteDestination] = useState<MapSpot | null>(null);
  const [navInfo, setNavInfo] = useState<{distance: number; duration: number} | null>(null);
  const [userBearing, setUserBearing] = useState(0);
  
  const [isSearching, setIsSearching] = useState(false);
  const [foundSpot, setFoundSpot] = useState<MapSpot | null>(null);
  const [showMapInfo, setShowMapInfo] = useState(true);

  const handleRouteFetched = React.useCallback((dist: number, dur: number, brng: number) => {
    if (dist === 0 && dur === 0) {
      setNavInfo(null);
      setUserBearing(0);
    } else {
      setNavInfo({ distance: dist, duration: dur });
      setUserBearing(brng);
    }
  }, []);

  const handlePublishRequest = () => {
    setShowRequestModal(false);
    setIsSearching(true);
    setActiveRouteDestination(null);
    setNavInfo(null);

    
    setTimeout(() => {
      setIsSearching(false);
      const validSpots = spotsWithStatus.filter(s => s.status === 'green');
      if (validSpots.length > 0) {
        const randomSpot = validSpots[Math.floor(Math.random() * validSpots.length)];
        setFoundSpot(randomSpot);
      } else {
        setFoundSpot({
          id: 'mock-' + Date.now(),
          lat: 40.9850 + (Math.random() - 0.5) * 0.015,
          lng: 29.0270 + (Math.random() - 0.5) * 0.015,
          timestamp: Date.now(),
          confidence: Math.round((0.85 + Math.random() * 0.14) * 100) / 100,
          source: 'mobile-app',
          ageSeconds: 5,
          status: 'green'
        });
      }
    }, 2500);
  };

  useEffect(() => {
    const updateAges = () => {
      const now = Date.now();
      const mapped = [...activeSpots, ...simulatedSpots].map(spot => {
        const _ageMs = now - spot.timestamp;
        const totalSec = Math.floor(_ageMs / 1000);
        
        let status: 'green' | 'yellow' | 'expired' = 'green';
        if (totalSec > 600) status = 'expired';
        else if (totalSec > 180) status = 'yellow';
        
        return { ...spot, ageSeconds: totalSec, status };
      }).filter(spot => spot.status !== 'expired');

      setSpotsWithStatus(mapped as MapSpot[]);
      
      // Update active route destination age if it exists
      if (activeRouteDestination) {
         const _ageMs = now - activeRouteDestination.timestamp;
         const totalSec = Math.floor(_ageMs / 1000);
         let status: 'green' | 'yellow' | 'expired' = 'green';
         if (totalSec > 600) status = 'expired';
         else if (totalSec > 180) status = 'yellow';
         setActiveRouteDestination(prev => prev ? { ...prev, ageSeconds: totalSec, status } : null);
      }
    };

    updateAges();
    const iv = setInterval(updateAges, 1000);
    return () => clearInterval(iv);
  }, [activeSpots, simulatedSpots]);

  const vehicles = [
    { id: 'hatchback', label: 'Hatchback', icon: Car },
    { id: 'sedan', label: 'Sedan', icon: Car },
    { id: 'suv', label: 'SUV', icon: Car },
    { id: 'kamyonet', label: 'Kamyonet', icon: Car },
  ];

  return (
    <div className="flex flex-col h-full bg-transparent text-zinc-100 p-0 md:p-8 relative pb-16 md:pb-8">
      {!activeRouteDestination && showMapInfo && (
        <div className="absolute top-4 left-4 right-4 md:static md:mb-6 flex justify-between items-start z-[400] shrink-0 pointer-events-auto">
          <div className="bg-zinc-950/80 p-3 md:p-4 rounded-xl border border-zinc-800 backdrop-blur-md shadow-lg relative w-full md:w-auto">
            <button 
              onClick={() => setShowMapInfo(false)}
              className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-white bg-zinc-900 rounded-full md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">CONSUMER LAYER (PHASE 2)</h3>
            <h2 className="text-lg md:text-xl font-black tracking-tighter text-white mb-1 md:mb-2">Park Haritası</h2>
            <p className="text-zinc-400 text-[10px] md:text-xs font-medium max-w-sm mr-6 md:mr-0">
              İstanbul / Kadıköy. Canlı park noktaları zaman damgası çürüme (Timestamp Decay) algoritması ile gösterilmektedir. 3 dk'dan eski veriler sarı renk ile riskli kabul edilir.
            </p>
          </div>
        </div>
      )}

      {activeRouteDestination && (
        <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-[400] w-full max-w-md px-4 pointer-events-auto flex flex-col gap-2">
           <div className="bg-zinc-950 border-2 border-emerald-500 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col gap-4">
               <div className="flex items-center gap-3">
                   <div className="bg-emerald-500/20 p-3 rounded-full text-emerald-500 shrink-0">
                      <Navigation className="w-8 h-8" />
                   </div>
                   <div>
                      <div className="text-white font-black text-2xl">
                         {navInfo ? `${Math.ceil(navInfo.duration / 60)} Dk` : 'Hesaplanıyor...'}
                      </div>
                      <div className="text-zinc-400 font-bold text-sm">
                         {navInfo ? `${(navInfo.distance / 1000).toFixed(1)} km` : ''} - Hedefe Yönlendiriliyorsunuz
                      </div>
                   </div>
               </div>
               <button 
                  onClick={() => {
                     setActiveRouteDestination(null);
                     setNavInfo(null);
                  }} 
                  className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold py-3 rounded-xl transition-colors"
               >
                  Navigasyonu Bitir
               </button>
           </div>
        </div>
      )}

      <div className="flex-1 relative md:rounded-xl overflow-hidden bg-zinc-900 md:border border-zinc-800 shadow-2xl">
        <MapContainer 
          center={[40.9850, 29.0270]} 
          zoom={15} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          <Marker position={[mockOrigin.lat, mockOrigin.lng]} icon={getMemoizedIcon('green', true, userBearing)}>
             <Popup className="custom-popup">
                <div className="text-xs font-bold text-zinc-900">Konumunuz</div>
             </Popup>
          </Marker>

          {!activeRouteDestination && spotsWithStatus.map((spot) => (
            <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={getMemoizedIcon(spot.status)}>
              <Popup className="custom-popup bg-zinc-950">
                  <div className="flex flex-col rounded-lg p-2 min-w-[160px] text-zinc-100">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-white uppercase tracking-widest">Boş Alan</span>
                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                         spot.status === 'green' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                       }`}>
                         {spot.status.toUpperCase()}
                       </span>
                    </div>
                    <div className="flex justify-between items-center text-xs mb-3">
                      <span className="font-mono text-zinc-400">Veri Yaşı</span>
                      <span className="font-mono text-zinc-100 font-bold">{spot.ageSeconds}s</span>
                    </div>
                    <button 
                      onClick={() => setActiveRouteDestination(spot)}
                      className="w-full flex justify-center items-center gap-1 text-[10px] font-bold px-2 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded cursor-pointer transition-colors"
                    >
                      <Navigation className="w-3 h-3" /> ROTA KİLİTLE
                    </button>
                  </div>
              </Popup>
            </Marker>
          ))}

          {activeRouteDestination && (
             <Marker position={[activeRouteDestination.lat, activeRouteDestination.lng]} icon={getMemoizedIcon(activeRouteDestination.status)}>
                <Popup className="custom-popup bg-zinc-950">
                   <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest p-1">
                      Hedef Otopark
                   </div>
                </Popup>
             </Marker>
          )}
          
          <RouteDisplay 
             origin={mockOrigin} 
             destination={activeRouteDestination} 
             onRouteFetched={handleRouteFetched}
          />
        </MapContainer>

        {!activeRouteDestination && !isSearching && !foundSpot && (
          <div className="absolute bottom-[24px] md:bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto z-[400] w-[90%] md:w-auto">
             <button 
               onClick={() => setShowRequestModal(true)}
               className="w-full md:w-auto px-6 py-4 bg-zinc-950 hover:bg-zinc-900 text-white rounded-full border-2 border-zinc-800 hover:border-emerald-500/50 shadow-2xl flex items-center justify-center gap-3 transition-all group"
             >
               <Search className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
               <span className="font-bold tracking-tight text-base md:text-lg">Park Yeri Talebi Oluştur</span>
             </button>
          </div>
        )}

        {!activeRouteDestination && showRequestModal && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col pointer-events-auto">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <div>
                   <h3 className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1">OTONOM REZERVASYON</h3>
                   <h2 className="text-xl font-black text-white">Alan Talebi</h2>
                </div>
                <button onClick={() => setShowRequestModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Hedef Konum</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Örn: Moda Caddesi, Kadıköy"
                      className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-lg py-3 pl-10 pr-4 text-white font-medium outline-none transition-colors"
                      defaultValue="Moda İlkokulu, Kadıköy"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Araç Tipi</label>
                  <div className="grid grid-cols-2 gap-3">
                    {vehicles.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVehicle(v.id)}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                          selectedVehicle === v.id 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        <v.icon className="w-6 h-6" />
                        <span className="text-xs font-bold">{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handlePublishRequest}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl transition-colors mt-2 text-lg"
                >
                  TALEBİ YAYINLA
                </button>
              </div>
            </div>
          </div>
        )}

        {isSearching && (
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
               <div className="text-emerald-500 font-black tracking-widest uppercase mt-4">Aktif Node'lar Taranıyor...</div>
               <div className="text-zinc-400 text-xs font-medium">Hedef bölgedeki Edge kameraları sorgulanıyor</div>
            </div>
          </div>
        )}

        {foundSpot && (
          <div className="absolute top-24 md:top-20 left-1/2 -translate-x-1/2 bg-zinc-950 border-2 border-emerald-500 rounded-xl p-4 md:p-6 shadow-2xl z-[500] flex flex-col gap-3 md:gap-4 w-[90%] max-w-sm pointer-events-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-widest text-[10px]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                Uygun Alan Bulundu
              </div>
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-1 flex items-center gap-1 rounded font-bold">
                %95+ Confidence
              </span>
            </div>
            
            <div>
              <div className="text-white font-black text-2xl tracking-tighter mb-1">Müsait Park Yeri</div>
              <div className="text-zinc-400 text-xs font-mono mb-1">Veri Yaşı: <strong className="text-zinc-200">{foundSpot.ageSeconds}s</strong></div>
            </div>

            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => {
                   setActiveRouteDestination(foundSpot);
                   setSimulatedSpots(prev => {
                     if (!prev.find(s => s.id === foundSpot.id)) {
                       return [...prev, { 
                         id: foundSpot.id, 
                         lat: foundSpot.lat, 
                         lng: foundSpot.lng, 
                         timestamp: foundSpot.timestamp, 
                         confidence: foundSpot.confidence, 
                         source: foundSpot.source 
                       }];
                     }
                     return prev;
                   });
                   setFoundSpot(null);
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                 YOL TARİFİ
              </button>
              <button 
                onClick={() => setFoundSpot(null)}
                className="px-4 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-bold py-3 rounded-xl transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
