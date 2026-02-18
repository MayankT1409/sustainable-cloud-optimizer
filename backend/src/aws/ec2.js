import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { assumeCustomerRole } from "./assumeRole.js";

export async function getInstances(roleArn) {
  const tempCreds = await assumeCustomerRole(roleArn);

  const client = new EC2Client({
    region: "ap-south-1",
    credentials: tempCreds,
  });

  const data = await client.send(
    new DescribeInstancesCommand({})
  );

  let count = 0;
  const details = [];

  data.Reservations?.forEach((reservation) => {
    reservation.Instances.forEach((instance) => {
      if (instance.State.Name === "running") count++;

      const nameTag = instance.Tags?.find(
        (tag) => tag.Key === "Name"
      );

      details.push({
        id: instance.InstanceId,
        name: nameTag?.Value || "N/A",
        type: instance.InstanceType,
        region: "ap-south-1",
        state: instance.State.Name,
        launchTime: instance.LaunchTime,
      });
    });
  });

  return {
    count,
    details,
  };
}
