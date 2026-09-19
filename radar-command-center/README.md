# RADAR Command Center (SIH PS 26177)

An offline-first, tactical edge dashboard for drone swarm telemetry and CRDT-based hazard synchronization. Designed for the Gruvbox dark aesthetic to minimize operator fatigue in high-stress disaster response scenarios.

## Tech Stack
* **Frontend Core:** React (Vite)
* **Styling:** Tailwind CSS v4 (Gruvbox Dark Palette)
* **Cartography:** React-Leaflet (configured for Cartesian SLAM grids)
* **Icons:** Lucide-React

## Getting Started (Local Setup)

To run this dashboard locally, ensure you have Node.js installed, then run the following commands in your terminal:

 **Clone the repository:**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd radar-command-center

   Install dependencies:

   npm install

   Start the development server:

   npm run dev

Gazebo Harmonic SLAM Integration (Local Maps)
This dashboard is configured to run completely offline using local 2D occupancy grids generated from Gazebo. To update the map to your latest simulation sweep:

Run your ROS 2 SLAM node and map the environment in Gazebo.

Save the map using the Nav2 map saver:
ros2 run nav2_map_server map_saver_cli -f my_map

Convert the resulting .pgm file to a standard .png format.

Name the file gazebo-map.png and drop it into the public/ directory of this repository (replacing the placeholder).

The React app automatically maps this image to a flat Cartesian coordinate system (L.CRS.Simple) and handles the dynamic zoom scaling.