export const mockDashboardData = {
    totalCost: 1250.50,
    savingsPotential: 350.20,
    activeServices: 12,
    carbonFootprint: 450, // kg CO2e
    costTrend: [
        { date: '2023-10-01', cost: 40 },
        { date: '2023-10-02', cost: 42 },
        { date: '2023-10-03', cost: 38 },
        { date: '2023-10-04', cost: 45 },
        { date: '2023-10-05', cost: 41 },
        { date: '2023-10-06', cost: 55 },
        { date: '2023-10-07', cost: 48 },
    ],
    serviceBreakdown: [
        { name: 'EC2', cost: 850, color: '#3b82f6' },
        { name: 'RDS', cost: 250, color: '#10b981' },
        { name: 'S3', cost: 100, color: '#f59e0b' },
        { name: 'Lambda', cost: 50.50, color: '#8b5cf6' },
    ]
};

export const mockEC2Instances = [
    {
        id: "i-0a1b2c3d4e5f6g7h",
        name: "web-server-01",
        type: "t3.medium",
        region: "us-east-1",
        state: "running",
        launchTime: "2023-09-15T10:00:00Z",
        hourlyCost: 0.0416,
        cpuUsage: 45,
        memoryUsage: 60,
        networkIn: "1.2 GB",
        networkOut: "4.5 GB",
        recommendation: "OPTIMIZED",
        tags: { Environment: "Production", App: "Web" }
    },
    {
        id: "i-9z8y7x6w5v4u3t2s",
        name: "dev-env-legacy",
        type: "m5.large",
        region: "us-east-1",
        state: "running",
        launchTime: "2023-08-01T08:30:00Z",
        hourlyCost: 0.096,
        cpuUsage: 2,
        memoryUsage: 15,
        networkIn: "0.1 GB",
        networkOut: "0.05 GB",
        recommendation: "TERMINATE", // Low usage
        tags: { Environment: "Dev", App: "Backend" }
    },
    {
        id: "i-1a2b3c4d5e6f7g8h",
        name: "worker-process-x",
        type: "c5.xlarge",
        region: "us-west-2",
        state: "stopped",
        launchTime: "2023-10-01T14:00:00Z",
        hourlyCost: 0.17,
        cpuUsage: 0,
        memoryUsage: 0,
        networkIn: "0 GB",
        networkOut: "0 GB",
        recommendation: "STOPPED",
        tags: { Environment: "Staging", App: "Worker" }
    },
    {
        id: "i-5e6f7g8h9i0j1k2l",
        name: "db-replica-01",
        type: "r5.large",
        region: "us-east-1",
        state: "running",
        launchTime: "2023-09-10T11:20:00Z",
        hourlyCost: 0.126,
        cpuUsage: 85,
        memoryUsage: 70,
        networkIn: "15 GB",
        networkOut: "2 GB",
        recommendation: "UPGRADE", // High usage
        tags: { Environment: "Production", App: "Database" }
    }
];
