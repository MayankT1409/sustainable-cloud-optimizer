export function calculateCO2(instanceCount) {
  // Simple MVP logic
  const avgCO2PerInstance = 8; // kg/month (dummy realistic value)
  return instanceCount * avgCO2PerInstance;
}
