/**
 * Carbon Intensity Factors (kg CO2 per kWh)
 * Source: Rough estimates based on IEA/Grid data
 */
const REGIONAL_INTENSITY = {
    "us-east-1": 0.38,
    "us-west-2": 0.25,
    "eu-west-1": 0.28,
    "eu-central-1": 0.35,
    "ap-south-1": 0.72, // India (High coal usage)
    "ap-southeast-1": 0.45,
    "default": 0.4,
};

/**
 * Calculates CO2 emissions based on kWh and region
 * @param {number} kwh - Energy consumption in kilowatt-hours
 * @param {string} region - Cloud region identifier
 * @returns {number} CO2 emissions in kg
 */
export function calculateCO2(kwh, region) {
    const intensity = REGIONAL_INTENSITY[region] || REGIONAL_INTENSITY["default"];
    return parseFloat((kwh * intensity).toFixed(4));
}

/**
 * Estimates kWh based on instance type and uptime
 * Rough estimation: 1 vCPU constant load ~ 0.05 kWh/hr
 * @param {string} instanceType - e.g. 't3.medium'
 * @param {number} uptimeHours - Hours running
 * @returns {number} Estimated kWh
 */
export function estimateKWh(instanceType, uptimeHours) {
    // Basic heuristics for estimation
    let vCPUs = 1;
    if (instanceType.includes("medium")) vCPUs = 2;
    if (instanceType.includes("large")) vCPUs = 4;
    if (instanceType.includes("xlarge")) vCPUs = 8;
    
    const powerConsumptionPerVCPU = 0.05; // kWh per hour per vCPU
    return vCPUs * powerConsumptionPerVCPU * uptimeHours;
}
