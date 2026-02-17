import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

const client = new EC2Client({
  region: process.env.AWS_REGION, // ap-south-1
});

export async function getInstances() {
  try {
    const data = await client.send(
      new DescribeInstancesCommand({})
    );

    let count = 0;

    data.Reservations?.forEach((reservation) => {
      reservation.Instances.forEach((instance) => {
        if (instance.State.Name === "running") {
          count++;
        }
      });
    });

    return count;
  } catch (error) {
    console.error("EC2 Fetch Error:", error);
    throw error;
  }
}
