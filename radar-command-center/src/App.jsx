import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import * as ROSLIB from 'roslib';
import { 
  ShieldAlert, BatteryCharging, WifiOff, Wifi, 
  Activity, Cpu, Flame, UserCheck, RefreshCw 
} from 'lucide-react';
import { cachedIncidents, initialTelemetry } from './mockData';

const survivorIcon = new L.DivIcon({
  className: 'custom-pin',
  html: `<div style="background-color:#b8bb26; width:16px; height:16px; border-radius:50%; border:2px solid #ebdbb2; box-shadow:0 0 10px #b8bb26;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const hazardIcon = new L.DivIcon({
  className: 'custom-pin',
  html: `<div style="background-color:#fb4934; width:16px; height:16px; border-radius:50%; border:2px solid #ebdbb2; box-shadow:0 0 10px #fb4934;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

function MapController({ selectedIncident, mapBounds }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(mapBounds);
  }, [map, mapBounds]);

  useEffect(() => {
    if (selectedIncident) {
      const baseZoom = map.getBoundsZoom(mapBounds);
      map.flyTo([selectedIncident.lat, selectedIncident.lng], baseZoom + 2, {
        animate: true,
        duration: 1.5 
      });
    }
  }, [selectedIncident, map, mapBounds]);
  
  return null;
}

const mapBounds = [[0, 0], [1000, 1000]];

const rosToLeaflet = (rosX, rosY) => {
  const scale = 10;
  const offsetX = 500;
  const offsetY = 500;
  return [offsetY - (rosY * scale), offsetX + (rosX * scale)];
};

export default function App() {
  const [incidents, setIncidents] = useState([]);
  const [telemetry, setTelemetry] = useState(initialTelemetry);
  const [isOffline, setIsOffline] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    const ros = new ROSLIB.Ros({
      url: 'ws://localhost:9090'
    });

    ros.on('connection', () => setIsOffline(false));
    ros.on('close', () => setIsOffline(true));
    ros.on('error', () => setIsOffline(true));

    const alertListener = new ROSLIB.Topic({
      ros: ros,
      name: '/telemetry/alerts',
      messageType: 'std_msgs/String'
    });

    alertListener.subscribe((message) => {
      try {
        const payload = JSON.parse(message.data);
        const [lat, lng] = rosToLeaflet(payload.location.x, payload.location.y);
        
        const newIncident = {
          id: `${payload.timestamp}-${Math.random()}`,
          label: payload.detection.class.toUpperCase(),
          type: payload.detection.class === 'person' ? 'SURVIVOR' : 'HAZARD',
          confidence: Math.round(payload.detection.confidence * 100),
          sector: `Sector (${payload.location.x}, ${payload.location.y})`,
          time: new Date().toLocaleTimeString(),
          unit: payload.drone_id,
          status: `DISPARITY: ${payload.detection.relative_depth}`,
          lat: lat,
          lng: lng
        };

        setIncidents((prev) => [newIncident, ...prev]);
      } catch (err) {
        console.error("Failed to parse incoming ROS alert:", err);
      }
    });

    return () => {
      alertListener.unsubscribe();
      ros.close();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#282828] text-[#ebdbb2]">
      <header className="h-14 border-b border-[#504945] bg-[#3c3836] flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-[#504945] border border-[#665c54]">
            <ShieldAlert className="w-5 h-5 text-[#fabd2f]" />
          </div>
          <span className="font-bold tracking-widest text-sm uppercase">
            RADAR Command Center
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-[#504945] text-[#a89984] border border-[#665c54]">
            SIH PS 26177
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded border transition-colors ${
            isOffline 
              ? 'bg-[#fb4934]/20 border-[#fb4934] text-[#fb4934]' 
              : 'bg-[#b8bb26]/20 border-[#b8bb26] text-[#b8bb26]'
          }`}>
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            {isOffline ? '● Disconnected from ROS' : '● Connected to ROS Bridge'}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r border-[#504945] bg-[#3c3836] flex flex-col">
          <div className="p-3 border-b border-[#504945] flex justify-between items-center text-xs">
            <span className="font-semibold tracking-wider text-[#a89984] uppercase">Live Incident Feed</span>
            <span className="px-2 py-0.5 rounded bg-[#504945] text-[#a89984] text-[10px]">{incidents.length} Events</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#504945] p-2 space-y-2">
            {incidents.map((inc) => (
              <div 
                key={inc.id} 
                onClick={() => setSelectedIncident(inc)}
                className={`p-3 rounded border text-xs flex flex-col gap-1 transition-all cursor-pointer ${
                  selectedIncident?.id === inc.id 
                    ? 'ring-2 ring-[#8ec07c] bg-[#8ec07c]/20 border-[#8ec07c] z-10 scale-[1.02]'
                    : inc.type === 'SURVIVOR' 
                      ? 'border-[#b8bb26]/40 bg-[#b8bb26]/10 hover:border-[#b8bb26]' 
                      : 'border-[#fb4934]/40 bg-[#fb4934]/10 hover:border-[#fb4934]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-bold flex items-center gap-1.5 ${
                    inc.type === 'SURVIVOR' ? 'text-[#b8bb26]' : 'text-[#fb4934]'
                  }`}>
                    {inc.type === 'SURVIVOR' ? <UserCheck className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
                    {inc.label}
                  </span>
                  <span className="text-[10px] text-[#928374]">{inc.time}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#a89984] mt-1">
                  <span>Confidence: <strong className="text-[#ebdbb2]">{inc.confidence}%</strong></span>
                  <span>{inc.sector}</span>
                </div>
                <div className="text-[10px] text-[#928374] flex justify-between mt-1 pt-1 border-t border-[#504945]">
                  <span>Unit: {inc.unit}</span>
                  <span className="text-[#a89984] font-mono">{inc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 relative">
          <MapContainer 
            crs={L.CRS.Simple}
            bounds={mapBounds}
            maxZoom={4}
            minZoom={-2} 
            scrollWheelZoom={true} 
            className="absolute inset-0 bg-[#282828]"
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <MapController selectedIncident={selectedIncident} mapBounds={mapBounds} />
            
            <ImageOverlay
              url="/gazebo-map.png"
              bounds={mapBounds}
            />
            
            {incidents.map((inc) => (
              <Marker 
                key={inc.id} 
                position={[inc.lat, inc.lng]}
                icon={inc.type === 'SURVIVOR' ? survivorIcon : hazardIcon}
              >
                <Popup className="tactical-popup">
                  <div className="text-xs p-1">
                    <strong className="block text-[#282828] font-bold">{inc.label}</strong>
                    <div className="text-[#3c3836] text-[11px] mt-0.5">Confidence: {inc.confidence}%</div>
                    <div className="text-[#504945] text-[10px]">{inc.sector} • {inc.time}</div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </main>

        <aside className="w-72 border-l border-[#504945] bg-[#3c3836] flex flex-col text-xs">
          <div className="p-3 border-b border-[#504945] flex justify-between items-center">
            <span className="font-semibold tracking-wider text-[#a89984] uppercase">Drone 01 Status</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#b8bb26]/20 border border-[#b8bb26] text-[#b8bb26]">
              Vanguard
            </span>
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[#a89984]">
                <span className="flex items-center gap-1.5"><BatteryCharging className="w-3.5 h-3.5 text-[#b8bb26]" /> Battery</span>
                <span className="text-[#ebdbb2] font-bold">{telemetry.battery}%</span>
              </div>
              <div className="w-full bg-[#504945] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#b8bb26] h-full rounded-full" style={{ width: `${telemetry.battery}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#504945]">
              <div className="p-2.5 rounded bg-[#282828] border border-[#504945]">
                <span className="text-[10px] text-[#928374] block">Altitude</span>
                <span className="text-sm font-bold text-[#ebdbb2]">{telemetry.altitude} m</span>
              </div>
              <div className="p-2.5 rounded bg-[#282828] border border-[#504945]">
                <span className="text-[10px] text-[#928374] block">Speed</span>
                <span className="text-sm font-bold text-[#ebdbb2]">{telemetry.speed} m/s</span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#282828] border border-[#504945] space-y-2">
              <span className="text-[10px] font-bold text-[#a89984] uppercase tracking-wider block">RB5 Edge Compute</span>
              <div className="flex justify-between items-center text-[#ebdbb2]">
                <span className="flex items-center gap-1.5 text-[#a89984]"><Cpu className="w-3.5 h-3.5 text-[#8ec07c]" /> SoC Temp</span>
                <span className="font-bold text-[#b8bb26]">{telemetry.socTemp}°C</span>
              </div>
              <div className="flex justify-between items-center text-[#ebdbb2]">
                <span className="flex items-center gap-1.5 text-[#a89984]"><Activity className="w-3.5 h-3.5 text-[#fabd2f]" /> NPU Load</span>
                <span className="font-bold text-[#ebdbb2]">{telemetry.npuLoad}</span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#282828] border border-[#504945] space-y-1.5">
              <span className="text-[10px] font-bold text-[#a89984] uppercase tracking-wider block">Positioning</span>
              <div className="flex justify-between text-[#a89984]">
                <span>GNSS Status:</span>
                <span className="text-[#b8bb26] font-semibold">{telemetry.gps}</span>
              </div>
              <div className="flex justify-between text-[#a89984]">
                <span>Mesh Link:</span>
                <span className="text-[#ebdbb2]">{telemetry.signal}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
