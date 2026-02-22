import { EC2Client, DescribeInstancesCommand, DescribeRegionsCommand } from "@aws-sdk/client-ec2";
import { assumeCustomerRole } from "./assumeRole.js";

export async function getInstances(roleArn) {
  const tempCreds = await assumeCustomerRole(roleArn);

  // 1. Get all enabled regions for this account
  const ec2Discovery = new EC2Client({
    region: "us-east-1",
    credentials: tempCreds,
  });

  const { Regions } = await ec2Discovery.send(new DescribeRegionsCommand({}));
  const enabledRegions = Regions.map(r => r.RegionName);

  let totalCount = 0;
  const allDetails = [];

  // 2. Scan all regions in parallel
  await Promise.all(enabledRegions.map(async (region) => {
    try {
      const client = new EC2Client({
        region: region,
        credentials: tempCreds,
      });

      const data = await client.send(new DescribeInstancesCommand({}));

      data.Reservations?.forEach((reservation) => {
        reservation.Instances.forEach((instance) => {
          if (instance.State.Name === "running") totalCount++;

          const nameTag = instance.Tags?.find(
            (tag) => tag.Key === "Name"
          );

          allDetails.push({
            id: instance.InstanceId,
            name: nameTag?.Value || "N/A",
            type: instance.InstanceType,
            region: region,
            state: instance.State.Name,
            launchTime: instance.LaunchTime,
          });
        });
      });
    } catch (err) {
      // Some regions might be disabled or restricted, we log and skip
      console.warn(`Skipping region ${region}:`, err.message);
    }
  }));

  return {
    count: totalCount,
    details: allDetails,
  };
}
