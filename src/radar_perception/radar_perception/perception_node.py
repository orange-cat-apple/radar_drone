import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from nav_msgs.msg import Odometry
from std_msgs.msg import String
from cv_bridge import CvBridge
from ultralytics import YOLO
import json
import os

class PerceptionNode(Node):
    def __init__(self):
        super().__init__('perception_node')
        self.model = YOLO('yolov8n.pt')
        self.bridge = CvBridge()
        self.odom_x, self.odom_y, self.odom_z = 0.0, 0.0, 0.0
        
        self.odom_sub = self.create_subscription(Odometry, '/odom', self.odom_callback, 10)
        self.img_sub = self.create_subscription(Image, '/camera/image_raw', self.img_callback, 10)
        self.alert_pub = self.create_publisher(String, '/telemetry/alerts', 10)
        
        self.file_path = '/home/fullord/radar_drone_ws/data/offline_queue.jsonl'
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        
        self.get_logger().info("Headless RADAR Perception Node Started.")

    def odom_callback(self, msg):
        self.odom_x = msg.pose.pose.position.x
        self.odom_y = msg.pose.pose.position.y
        self.odom_z = msg.pose.pose.position.z

    def img_callback(self, msg):
        try:
            cv_image = self.bridge.imgmsg_to_cv2(msg, "bgr8")
        except Exception as e:
            self.get_logger().warn(f"CV Bridge Error: {e}")
            return

        results = self.model(cv_image, verbose=False)
        
        for result in results:
            for box in result.boxes:
                class_name = self.model.names[int(box.cls[0])]
                confidence = float(box.conf[0])
                x_min, y_min, x_max, y_max = [float(v) for v in box.xyxy[0]]

                event_payload = {
                    "timestamp": str(self.get_clock().now().to_msg().sec),
                    "drone_id": "RADAR-01",
                    "detection": {
                        "class": class_name,
                        "confidence": round(confidence, 2),
                        "bbox": {"x_min": round(x_min, 1), "y_min": round(y_min, 1), "x_max": round(x_max, 1), "y_max": round(y_max, 1)}
                    },
                    "location": {
                        "latitude": self.odom_x,
                        "longitude": self.odom_y,
                        "altitude": self.odom_z
                    },
                    "source": "YOLOv8"
                }
                
                json_str = json.dumps(event_payload)
                
                msg_out = String()
                msg_out.data = json_str
                self.alert_pub.publish(msg_out)
                
                self.get_logger().info(f"Published: {class_name} ({confidence:.2f})")
                
                with open(self.file_path, 'a') as f:
                    f.write(json_str + '\n')
                    f.flush()

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