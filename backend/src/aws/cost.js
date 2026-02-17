import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

const client = new CostExplorerClient({
  region: "us-east-1",
});

export async function getMonthlyCost() {
  try {
    const command = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: "2026-02-01",
        End: "2026-02-28",
      },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
    });

    const data = await client.send(command);

    return data.ResultsByTime?.[0]?.Total?.UnblendedCost?.Amount || 0;
  } catch (error) {
    console.error("Cost Explorer Error:", error);
    throw error;
  }
}
