import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

import { assumeCustomerRole } from "./assumeRole.js";

export async function getMonthlyCost(roleArn) {
  try {
    const tempCreds = await assumeCustomerRole(roleArn);

    const client = new CostExplorerClient({
      region: "us-east-1", // Cost Explorer always us-east-1
      credentials: tempCreds,
    });

    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    // Start from 6 months ago (1st of that month)
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];

    console.log(`[AWS] Querying 6-month history from ${startDate} to ${endDate}`);

    const command = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: startDate,
        End: endDate,
      },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
      GroupBy: [
        {
          Type: "DIMENSION",
          Key: "SERVICE",
        },
      ],
    });

    const data = await client.send(command);
    console.log(`[AWS] Cost Explorer returned ${data.ResultsByTime?.[0]?.Groups?.length || 0} service groups.`);

    let totalCost = 0;
    const breakdown = {};
    const trend = [];

    data.ResultsByTime?.forEach((timeBucket) => {
      const monthTotal = parseFloat(timeBucket.Total?.UnblendedCost?.Amount || 0);
      trend.push({
        period: timeBucket.TimePeriod.Start,
        cost: monthTotal.toFixed(2)
      });

      timeBucket.Groups?.forEach((group) => {
        const service = group.Keys[0];
        const amount = parseFloat(group.Metrics?.UnblendedCost?.Amount || 0);
        if (amount > 0) {
          // We only use the latest month's breakdown for the pie chart
          // or we could sum them all, but typically users want to see "where is my money going NOW"
          // Let's sum them for the 6-month total to match the user's "last 6 month" request
          breakdown[service] = (breakdown[service] || 0) + amount;
          totalCost += amount;
        }
      });
    });

    return {
      total: totalCost.toFixed(2),
      breakdown,
      trend
    };
  } catch (error) {
    console.error("Cost Explorer Error:", error);
    throw error;
  }
}
