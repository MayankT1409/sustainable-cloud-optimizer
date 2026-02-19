import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { DollarSign, TrendingDown, Leaf, Activity, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useCloud } from "../context/CloudContext";

export function Dashboard() {
    const { selectedCloud, awsRoleArn, credentialsLoading } = useCloud();
    const navigate = useNavigate();
    const [data, setData] = useState({
        totalCost: 0,
        savingsPotential: 0,
        activeServices: 0,
        carbonFootprint: 0,
        costTrend: [],
        serviceBreakdown: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!selectedCloud) return; // Should be handled by redirection but safe guard

            setLoading(true);
            try {
                let endpoint = '';
                let body = {};

                switch (selectedCloud) {
                    case 'aws':
                        endpoint = '/api/aws/summary';
                        if (!awsRoleArn) {
                            setLoading(false);
                            return;
                        }
                        body = { roleArn: awsRoleArn };
                        break;
                    case 'azure':
                        endpoint = '/api/azure/summary';
                        body = { subscriptionId: "mock-sub-id" };
                        break;
                    case 'gcp':
                        endpoint = '/api/gcp/summary';
                        body = { projectId: "mock-project-id" };
                        break;
                    default:
                        return;
                }

                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                });

                const result = await response.json();

                setData({
                    totalCost: parseFloat(result.monthlyCost || 0),
                    savingsPotential: 0, // Mock logic could be added
                    activeServices: result.activeInstances || 0,
                    carbonFootprint: result.estimatedCO2 || 0,
                    costTrend: [ // Mock trend for now
                        { date: '2023-10-01', cost: 40 },
                        { date: '2023-10-02', cost: 42 },
                        { date: '2023-10-03', cost: 38 },
                        { date: '2023-10-04', cost: 45 },
                        { date: '2023-10-05', cost: 41 },
                        { date: '2023-10-06', cost: 55 },
                        { date: '2023-10-07', cost: 48 },
                    ],
                    serviceBreakdown: [
                        { name: selectedCloud.toUpperCase() + ' Compute', cost: parseFloat(result.monthlyCost || 0), color: '#3b82f6' },
                        { name: 'Others', cost: 0, color: '#10b981' },
                    ]
                });

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [selectedCloud, awsRoleArn]);

    const stats = [
        {
            title: "Total Monthly Cost",
            value: `$${data.totalCost.toLocaleString()}`,
            icon: DollarSign,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Potential Savings",
            value: `$${data.savingsPotential.toLocaleString()}`,
            icon: TrendingDown,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
        },
        {
            title: "Active Services",
            value: data.activeServices,
            icon: Activity,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            title: "Carbon Footprint",
            value: `${data.carbonFootprint} kg`,
            icon: Leaf,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
    ];

    // Show warning if AWS selected but no credentials configured
    if (selectedCloud === 'aws' && !credentialsLoading && !awsRoleArn) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl px-6 py-4">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">AWS Credentials Not Configured</p>
                        <p className="text-sm text-orange-300/70 mt-0.5">Please add your AWS Role ARN to view your dashboard.</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/aws-credentials')}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-medium px-6 py-2.5 rounded-xl transition-all"
                >
                    Configure AWS Credentials
                </button>
            </div>
        );
    }

    if (loading || credentialsLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-slate-400 animate-pulse">Loading dashboard data...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-slate-400">Overview of your cloud infrastructure and costs.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Cost Trend (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.costTrend}>
                                    <defs>
                                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                        itemStyle={{ color: '#f8fafc' }}
                                        cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                                    />
                                    <Area type="monotone" dataKey="cost" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCost)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Service Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.serviceBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="cost"
                                    >
                                        {data.serviceBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `$${value}`}
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Legend Overlay or Center Text if needed */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold">${data.totalCost.toLocaleString()}</span>
                                <span className="text-xs text-slate-400 uppercase tracking-widest">Total</span>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {data.serviceBreakdown.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm text-slate-300">{item.name}</span>
                                    <span className="text-sm font-medium ml-auto">${item.cost}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
