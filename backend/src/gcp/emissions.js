export function calculateCO2(instanceCount) {
    // Simple MVP logic for GCP
    // GCP is generally green, lower emissions
    const avgCO2PerInstance = 5; // kg/month (dummy realistic value)
    return instanceCount * avgCO2PerInstance;
}
