import os
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import AnyLaunchDescriptionSource
from ament_index_python.packages import get_package_share_directory

def generate_launch_description():
    ld = LaunchDescription()

    perception_node = Node(
        package='radar_perception',
        executable='perception_node',
        name='perception_node',
        output='screen'
    )

    rosbridge_launch = IncludeLaunchDescription(
        AnyLaunchDescriptionSource(
            os.path.join(
                get_package_share_directory('rosbridge_server'),
                'launch',
                'rosbridge_websocket_launch.xml'
            )
        )
    )

    ld.add_action(perception_node)
    ld.add_action(rosbridge_launch)
    return ld
