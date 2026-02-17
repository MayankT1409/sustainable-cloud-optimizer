import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

const client = new EC2Client({
  region: process.env.AWS_REGION || "us-east-1",
});

export async function getInstances() {
  try {
    const data = await client.send(new DescribeInstancesCommand({}));

    const instances = [];
    let runningCount = 0;

    data.Reservations?.forEach((reservation) => {
      reservation.Instances.forEach((instance) => {
        const nameTag = instance.Tags?.find(t => t.Key === "Name")?.Value || instance.InstanceId;

        if (instance.State.Name === "running") {
          runningCount++;
        }

        instances.push({
          id: instance.InstanceId,
          name: nameTag,
          type: instance.InstanceType,
          region: client.config.region,
          state: instance.State.Name,
          launchTime: instance.LaunchTime,
          publicIp: instance.PublicIpAddress,
          privateIp: instance.PrivateIpAddress,
          tags: instance.Tags
        });
      });
    });

    return { count: runningCount, details: instances };
  } catch (error) {
    console.error("EC2 Fetch Error:", error);
    throw error; // Re-throw to be handled by the route
  }
}
