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

    const command = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: "2026-02-01",
        End: "2026-02-28",
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

    let totalCost = 0;
    const breakdown = {};

    data.ResultsByTime?.[0]?.Groups?.forEach((group) => {
      const service = group.Keys[0];
      const amount = parseFloat(group.Metrics?.UnblendedCost?.Amount || 0);
      breakdown[service] = amount;
      totalCost += amount;
    });

    return {
      total: totalCost.toFixed(2),
      breakdown,
    };
  } catch (error) {
    console.error("Cost Explorer Error:", error);
    throw error;
  }
}
