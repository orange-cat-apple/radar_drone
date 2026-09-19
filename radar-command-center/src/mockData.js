// 1. CACHED DATA (What the commander sees while offline)
// Represents the drone's initial sweep before losing mesh connection
export const cachedIncidents = [
  {
    id: "INC-089",
    type: "HAZARD",
    label: "STRUCTURAL COLLAPSE",
    confidence: 98.2,
    time: "19:54:12",
    unit: "RADAR-01",
    lat: 150, 
    lng: 220, 
    sector: "Sector A1 - Lobby",
    status: "ACTIVE"
  },
  {
    id: "INC-090",
    type: "SURVIVOR",
    label: "HEAT SIGNATURE",
    confidence: 76.5,
    time: "19:56:30",
    unit: "RADAR-01",
    lat: 280,
    lng: 310,
    sector: "Sector A2 - Hallway",
    status: "INVESTIGATING"
  },
  {
    id: "INC-091",
    type: "HAZARD",
    label: "TOXIC GAS (CO)",
    confidence: 94.0,
    time: "20:01:45",
    unit: "RADAR-01",
    lat: 410,
    lng: 450,
    sector: "Sector B1 - Vents",
    status: "CRITICAL"
  },
  {
    id: "INC-092",
    type: "SURVIVOR",
    label: "PERSON ALRT",
    confidence: 91.5,
    time: "20:08:12",
    unit: "RADAR-01",
    lat: 500,
    lng: 480,
    sector: "Sector C3 - Lab",
    status: "CONFIRMED"
  }
];

// 2. PENDING DATA (The Delta Cache)
// Represents the data the drone recorded in the "dark zone". 
// This will stream in dramatically when you click "Connect & Sync".
export const pendingSyncIncidents = [
  {
    id: "INC-093",
    type: "HAZARD",
    label: "EXPOSED HIGH VOLTAGE",
    confidence: 99.1,
    time: "20:12:05",
    unit: "RADAR-01",
    lat: 580,
    lng: 620,
    sector: "Sector C4 - Utility",
    status: "ACTIVE"
  },
  {
    id: "INC-094",
    type: "SURVIVOR",
    label: "UNCONSCIOUS VICTIM",
    confidence: 88.4,
    time: "20:13:40",
    unit: "RADAR-01",
    lat: 650,
    lng: 680,
    sector: "Sector D1 - Storage",
    status: "CONFIRMED"
  },
  {
    id: "INC-095",
    type: "HAZARD",
    label: "CHEMICAL SPILL (ACID)",
    confidence: 95.7,
    time: "20:15:12",
    unit: "RADAR-01",
    lat: 720,
    lng: 700,
    sector: "Sector D2 - Lab 2",
    status: "CRITICAL"
  },
  {
    id: "INC-096",
    type: "SURVIVOR",
    label: "MULTIPLE HEAT SIGS",
    confidence: 82.0,
    time: "20:16:33",
    unit: "RADAR-01",
    lat: 800,
    lng: 780,
    sector: "Sector E1 - Cafeteria",
    status: "INVESTIGATING"
  },
  {
    id: "INC-097",
    type: "HAZARD",
    label: "ACTIVE FIRE SPREAD",
    confidence: 97.8,
    time: "20:18:01",
    unit: "RADAR-01",
    lat: 850,
    lng: 850,
    sector: "Sector E2 - Kitchen",
    status: "CRITICAL"
  },
  {
    id: "INC-098",
    type: "SURVIVOR",
    label: "SOS AUDIO DETECTED",
    confidence: 93.2,
    time: "20:19:45",
    unit: "RADAR-01",
    lat: 880,
    lng: 880,
    sector: "Sector E2 - Pantry",
    status: "CONFIRMED"
  }
];

// 3. TELEMETRY
export const initialTelemetry = {
  droneId: "RADAR-01",
  battery: 78,
  altitude: 3.2,       // Changed to 3.2m (realistic indoor flight height)
  speed: 1.4,          // Changed to 1.4 m/s (careful indoor exploration speed)
  signal: "MESH LINK ESTABLISHED",
  gps: "DENIED (SLAM ONLY)", // Changed to reflect offline/indoor Gazebo environment
  socTemp: 42,
  npuLoad: "64%",
  mode: "OFFLINE-CRDT"
};