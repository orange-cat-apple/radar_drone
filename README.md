# RADAR: Edge AI Perception & Command Dashboard

This repository contains the Edge AI Perception Node (Member-4) and the Command Center Dashboard (Members 5 & 6) for the RADAR drone prototype.

## System Architecture

The perception pipeline acts as a bridge between the drone's sensory hardware (simulation) and the command dashboard. It performs real-time YOLOv8 object detection, fuses the bounding box data with live odometry, and routes structured JSON events to both a live ROS 2 topic and an offline fault-tolerant cache.

1. **Input:** ROS 2 Image and Odometry topics.
2. **Processing:** YOLOv8 Nano (`yolov8n.pt`) via OpenCV Bridge.
3. **Storage:** JSON Lines (`.jsonl`) append-only offline queue.
4. **Output:** FastAPI WebSocket server broadcasting to a Leaflet/Tailwind HTML frontend.

---

## Member-3 Integration Contract

To successfully interface the Gazebo simulation with this perception pipeline, Member-3 must configure their simulation nodes to broadcast to the following specific ROS 2 topics.

### Required Inputs (From Simulation -> Perception Node)

- **Topic:** `/camera/image_raw`
  - **Type:** `sensor_msgs/msg/Image`
  - **Description:** The downward-facing camera feed from the Gazebo drone model.
- **Topic:** `/odom`
  - **Type:** `nav_msgs/msg/Odometry`
  - **Description:** The live spatial coordinates (x, y, z) of the drone used for geo-tagging detections.

### Provided Outputs (From Perception Node -> Simulation/Other)

- **Topic:** `/telemetry/alerts`
  - **Type:** `std_msgs/msg/String`
  - **Description:** A JSON-formatted string containing target class, confidence, bounding box, and location. Member-3 may subscribe to this if the flight controller requires target-based navigation adjustments.

---

## Setup & Execution Instructions

### 1. Environment Preparation

The system requires a Python virtual environment to isolate the AI dependencies from the global ROS 2 Humble installation.

```bash
cd ~/radar_drone_ws
python3 -m venv .venv
source .venv/bin/activate
pip install ultralytics fastapi uvicorn websockets
```

### 2. Building the Workspace

```bash
cd ~/radar_drone_ws
colcon build --packages-select radar_perception
source install/setup.bash
export PYTHONPATH=~/radar_drone_ws/.venv/lib/python3.10/site-packages:$PYTHONPATH
```

### 3. Launching the System

The system requires two separate terminals running concurrently (alongside the Gazebo simulation).

**Terminal A: Perception Node**

```bash
source ~/radar_drone_ws/install/setup.bash
export PYTHONPATH=~/radar_drone_ws/.venv/lib/python3.10/site-packages:$PYTHONPATH
ros2 run radar_perception perception_node
```

**Terminal B: Command Dashboard**

```bash
cd ~/radar_drone_ws/dashboard
source ~/radar_drone_ws/.venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000
```

Access the dashboard at: `http://localhost:8000`
