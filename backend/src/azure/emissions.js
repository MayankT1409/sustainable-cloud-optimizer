export function calculateCO2(instanceCount) {
    // Simple MVP logic for Azure
    // Azure datacenter efficiency might differ, let's assume slightly different avg
    const avgCO2PerInstance = 7.5; // kg/month (dummy realistic value)
    return instanceCount * avgCO2PerInstance;
}
