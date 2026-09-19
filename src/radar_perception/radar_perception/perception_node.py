import os
import json
import numpy as np
import cv2
import torch
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from nav_msgs.msg import Odometry
from std_msgs.msg import String
from cv_bridge import CvBridge
from ultralytics import YOLOWorld

class PerceptionNode(Node):
    def __init__(self):
        super().__init__('perception_node')
        self.yolo_model = YOLOWorld('yolov8s-world.pt')
        self.target_classes = ["person", "bus"]
        self.yolo_model.set_classes(self.target_classes)
        self.midas_model = torch.hub.load("intel-isl/MiDaS", "MiDaS_small", trust_repo=True)
        self.midas_model.eval()
        midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms", trust_repo=True)
        self.transform = midas_transforms.small_transform
        self.bridge = CvBridge()
        self.odom_x = 0.0
        self.odom_y = 0.0
        self.odom_z = 0.0
        self.is_processing = False
        self.odom_sub = self.create_subscription(Odometry, '/odom', self.odom_callback, 10)
        self.img_sub = self.create_subscription(Image, '/camera/image_raw', self.img_callback, 1)
        self.alert_pub = self.create_publisher(String, '/telemetry/alerts', 10)
        self.file_path = os.path.expanduser('~/radar_drone_ws/data/offline_queue.jsonl')
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        self.get_logger().info("Spatial Perception Node (YOLO-World + MiDaS) Initialized.")

    def odom_callback(self, msg):
        self.odom_x = msg.pose.pose.position.x
        self.odom_y = msg.pose.pose.position.y
        self.odom_z = msg.pose.pose.position.z

    def img_callback(self, msg):
        if self.is_processing:
            return
        self.is_processing = True
        try:
            cv_image = self.bridge.imgmsg_to_cv2(msg, "bgr8")
            img_rgb = cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB)
            results = self.yolo_model(cv_image, conf=0.25, verbose=False)
            
            depth_map = None
            has_detections = any(len(r.boxes) > 0 for r in results)
            
            if not has_detections:
                self.get_logger().info("No targets detected in frame.")
                return

            input_batch = self.transform(img_rgb)
            with torch.no_grad():
                prediction = self.midas_model(input_batch)
                prediction = torch.nn.functional.interpolate(
                    prediction.unsqueeze(1),
                    size=img_rgb.shape[:2],
                    mode="bicubic",
                    align_corners=False,
                ).squeeze()
                depth_map = prediction.cpu().numpy()

            for result in results:
                for box in result.boxes:
                    class_idx = int(box.cls[0])
                    class_name = self.yolo_model.names[class_idx]
                    confidence = float(box.conf[0])
                    x_min, y_min, x_max, y_max = map(int, box.xyxy[0])
                    
                    median_depth = 0.0
                    if depth_map is not None:
                        roi = depth_map[y_min:y_max, x_min:x_max]
                        if roi.size > 0:
                            median_depth = float(np.median(roi))

                    event_payload = {
                        "timestamp": str(self.get_clock().now().to_msg().sec),
                        "drone_id": "RADAR-01",
                        "detection": {
                            "class": class_name,
                            "confidence": round(confidence, 2),
                            "relative_depth": round(median_depth, 2),
                            "bbox": {
                                "x_min": x_min,
                                "y_min": y_min,
                                "x_max": x_max,
                                "y_max": y_max
                            }
                        },
                        "location": {
                            "x": round(self.odom_x, 2),
                            "y": round(self.odom_y, 2),
                            "z": round(self.odom_z, 2)
                        },
                        "source": "YOLO-World + MiDaS"
                    }

                    json_str = json.dumps(event_payload)
                    msg_out = String()
                    msg_out.data = json_str
                    self.alert_pub.publish(msg_out)
                    
                    with open(self.file_path, 'a') as f:
                        f.write(json_str + '\n')
                        f.flush()
                    
                    self.get_logger().info(f"Target: {class_name} | Disparity: {median_depth:.1f} | Pos: ({self.odom_x:.1f}, {self.odom_y:.1f}, {self.odom_z:.1f})")
        except Exception as e:
            self.get_logger().warn(f"Error: {e}")
        finally:
            self.is_processing = False

def main(args=None):
    rclpy.init(args=args)
    node = PerceptionNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
