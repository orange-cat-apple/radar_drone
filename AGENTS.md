# RADAR Drone - Member 4 (Edge AI Perception)

## Project Context
This is an autonomous Search and Rescue (SAR) drone prototype.
Member-4 is responsible for the Edge AI perception pipeline, which ingests simulated camera feeds, detects objects, and fuses this data into geo-tagged JSON events.

## Architecture & Stack
- OS: Ubuntu 22.04
- Middleware: ROS2 Humble
- AI Frameworks: PyTorch, Ultralytics (YOLOv8 Nano - `yolov8n.pt`), OpenCV, `cv_bridge`
- Output Format: Geo-tagged JSON payload via FastAPI

## Interfaces
- **Inputs (from Member-3)**: Simulated ROS2 topics (e.g., `/camera/image_raw`, `/odom`, `/tf`).
- **Outputs (to Members 5 & 6)**: Structured JSON containing timestamp, drone ID, bounding boxes, confidence, class, and localization data.

## Coding Rules & Constraints
- Inspect the repository and existing implementation before making changes.
- Do not assume that files, packages, topics, APIs, or dependencies exist. Verify them first.
- Preserve working functionality and make minimal, isolated changes.
- Do not add comments in the code until asked for.
- Explanations should use precise terminology and structured reasoning while presenting the concepts in a clear, accessible manner for easier understanding.
- Never modify Member-3's simulation or navigation interfaces without explicit agreement.
- Verify dependencies and run relevant ROS2 build checks (`colcon build`) before reporting success.
