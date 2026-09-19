# RADAR Perception Pipeline Integration Guide

This document outlines the finalized ROS 2 spatial perception architecture, message contracts, and integration steps for simulation and custom node environments.

## 1. Architecture and Topic Interfaces

The `perception_node` operates as a standalone ROS 2 node using YOLO-World (v8s) for object detection and MiDaS (Small) for monocular depth estimation.

### Subscribed Topics (Inputs)

To feed data into the perception node, your simulation or hardware nodes must publish to the following standard topics:

* `/camera/image_raw` (`sensor_msgs/msg/Image`): Expects standard BGR8 image matrices.
* `/odom` (`nav_msgs/msg/Odometry`): Expects absolute or localized positioning to tag spatial coordinates to detections.

### Published Topics (Outputs)

The node processes the synchronized frames and publishes alert data:

* `/telemetry/alerts` (`std_msgs/msg/String`): Outputs a serialized JSON payload containing the spatial bounding box, confidence, median disparity depth, and the drone's XYZ coordinates at the time of detection.

**JSON Payload Contract:**

```json
{
  "timestamp": "1789790177",
  "drone_id": "RADAR-01",
  "detection": {
    "class": "bus",
    "confidence": 0.87,
    "relative_depth": 460.2,
    "bbox": {
      "x_min": 0,
      "y_min": 200,
      "x_max": 640,
      "y_max": 480
    }
  },
  "location": {
    "x": -25.0,
    "y": 15.5,
    "z": 4.0
  },
  "source": "YOLO-World + MiDaS"
}

```

> **Note:** All payloads are also appended locally to `~/radar_drone_ws/data/offline_queue.jsonl` for offline dashboard synchronization or telemetry backup.

## 2. Adapting for Custom Namespaces and Simulations

If your simulation uses custom namespaces (e.g., `/uav1/front_cam/image` instead of `/camera/image_raw`), use ROS 2 topic remapping at runtime:

```bash
ros2 launch radar_perception start_pipeline.launch.py \
  --ros-args -r /camera/image_raw:=/your_custom_sim/camera/image \
             -r /odom:=/your_custom_sim/odometry

```

If you need to change tracked target classes from `["person", "bus"]` to custom simulation hazards (e.g., `["fire", "spill"]`), modify the `self.target_classes` array in `~/radar_drone_ws/src/radar_perception/radar_perception/perception_node.py` and rebuild.

## 3. Map Integration (2D SLAM & 3D OctoMap)

The React dashboard visualizes live incident feeds overlaid on a 2D occupancy grid (`/map`).

**For 2D SLAM (slam_toolbox, cartographer):**
Ensure your node publishes to `/map` (`nav_msgs/msg/OccupancyGrid`) and maintains a valid `tf` tree (`map → odom → base_link`).

**For 3D Simulation Environments (.bt files):**
If your simulation exports a 3D environment as a binary tree (`.bt`) file, you can project it into a 2D grid for the dashboard using `octomap_server`:

```bash
sudo apt install ros-humble-octomap-server
ros2 run octomap_server octomap_server_node --ros-args -p octomap_path:=/absolute/path/to/environment.bt -p frame_id:=map -r /projected_map:=/map

```

## 4. Repository File Structure & Artifact Reference

```text
radar_drone/
├── data/
│   ├── dummy_pub.py                     # Offline data generation script
│   └── offline_queue.jsonl              # Local detection persistence log
├── radar-command-center/                # React dashboard (tracked directory)
│   ├── src/
│   │   ├── App.jsx                      # UI entrypoint with live ROS WebSocket bridge & coordinate transform
│   │   ├── main.jsx
│   │   └── mockData.js                  # Fallback mock telemetry
│   ├── package.json                     # Frontend dependencies including roslib
│   └── vite.config.js
├── src/
│   └── radar_perception/
│       ├── launch/
│       │   └── start_pipeline.launch.py # Orchestrates perception_node & rosbridge_websocket
│       ├── radar_perception/
│       │   ├── __init__.py
│       │   └── perception_node.py       # Core YOLO-World + MiDaS ROS 2 perception node
│       ├── package.xml
│       ├── setup.cfg
│       └── setup.py                     # Configured with launch file installation paths
├── test_spatial_pub.py                  # Standalone mock camera and odometry publisher
├── bus.jpg                              # Calibration and testing visual asset
├── fire.jpg                             # Secondary detection test frame
└── real_bus.jpg                         # Benchmark verification frame

```

## 5. Execution Workflow (Team Member 3 Integration)

The pipeline and frontend have been fully pre-configured. The dashboard submodule has been converted to a standard directory (resolving 403 Git errors), and the React UI is natively hooked up to the ROS WebSocket bridge with dynamic metric-to-pixel coordinate scaling.

To run the full stack with simulation data, follow these exact steps:

### Step 1: Pull Latest Artifacts and Build

```bash
cd ~/radar_drone_ws
git pull origin main
source .venv/bin/activate
colcon build --packages-select radar_perception
source install/setup.bash

```

### Step 2: Start Core ROS 2 Pipeline (Terminal 1)

This unified launch file automatically spins up both the YOLO/MiDaS perception node and the WebSocket bridge (port 9090) required by the React dashboard.

```bash
cd ~/radar_drone_ws
source .venv/bin/activate
source install/setup.bash
ros2 launch radar_perception start_pipeline.launch.py

```

### Step 3: Start Command Center Dashboard (Terminal 2)

```bash
cd ~/radar_drone_ws/radar-command-center
npm install
npm run dev

```

Navigate to `http://localhost:5173`. The connection badge should read **"Connected to ROS Bridge"**.

### Step 4: Stream Simulation Data or Verify (Terminal 3)

Run the built-in verification script to ensure alerts plot correctly on the UI:

```bash
cd ~/radar_drone_ws
source .venv/bin/activate
source install/setup.bash
python3 test_spatial_pub.py

```

*Once verified, terminate the test script and launch your simulation environment, ensuring it publishes to `/camera/image_raw` and `/odom` (or use the remap arguments described in Section 2).*
