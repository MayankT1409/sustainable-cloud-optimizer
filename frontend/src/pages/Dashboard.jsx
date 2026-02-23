import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { DollarSign, TrendingDown, Leaf, Activity, AlertTriangle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useCloud } from "../context/CloudContext";

export function Dashboard() {
    const { cloud: urlCloud } = useParams();
    const {
        selectedCloud,
        setSelectedCloud,
        awsRoleArn,
        azureSubId, azureTenantId, azureClientId, azureClientSecret,
        gcpProjectId, gcpServiceAccountKey,
        credentialsLoading
    } = useCloud();
    const navigate = useNavigate();

    useEffect(() => {
        if (urlCloud && urlCloud !== selectedCloud) {
            setSelectedCloud(urlCloud);
        }
    }, [urlCloud, selectedCloud, setSelectedCloud]);
    const [data, setData] = useState({
        accountId: '',
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
                        if (!azureSubId) {
                            setLoading(false);
                            return;
                        }
                        body = {
                            subscriptionId: azureSubId,
                            tenantId: azureTenantId,
                            clientId: azureClientId,
                            clientSecret: azureClientSecret
                        };
                        break;
                    case 'gcp':
                        endpoint = '/api/gcp/summary';
                        if (!gcpProjectId) {
                            setLoading(false);
                            return;
                        }
                        body = {
                            projectId: gcpProjectId,
                            serviceAccountKey: gcpServiceAccountKey
                        };
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

                // Dynamic service breakdown colors
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                const breakdown = result.costBreakdown
                    ? Object.entries(result.costBreakdown).map(([name, cost], index) => ({
                        name: name.replace('Amazon ', '').replace('Elastic ', ''),
                        cost: parseFloat(cost),
                        color: colors[index % colors.length]
                    }))
                    : [];

                setData({
                    accountId: result.accountId,
                    totalCost: parseFloat(result.totalCost6Months || 0),
                    savingsPotential: 0,
                    activeServices: result.costBreakdown ? Object.keys(result.costBreakdown).length : (result.activeInstances || 0),
                    carbonFootprint: result.estimatedCO2 || 0,
                    costTrend: result.costTrend ? result.costTrend.map(t => ({
                        date: new Date(t.period).toLocaleDateString('en-US', { month: 'short' }),
                        cost: parseFloat(t.cost)
                    })) : [],
                    serviceBreakdown: breakdown
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

    // Show warning if credentials are not configured for the selected cloud
    const hasCredentials = () => {
        if (selectedCloud === 'aws') return !!awsRoleArn;
        if (selectedCloud === 'azure') return !!azureSubId;
        if (selectedCloud === 'gcp') return !!gcpProjectId;
        return true;
    };

    if (!credentialsLoading && !hasCredentials()) {
        const configPath = {
            aws: '/aws-credentials',
            azure: '/azure-credentials',
            gcp: '/gcp-credentials'
        }[selectedCloud];

        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 text-primary rounded-xl px-6 py-4">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div>
                        <p className="font-medium uppercase">{selectedCloud} Credentials Not Configured</p>
                        <p className="text-sm text-slate-400 mt-0.5">Please add your {selectedCloud.toUpperCase()} credentials to view your dashboard.</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(configPath)}
                    className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2.5 rounded-xl transition-all"
                >
                    Configure {selectedCloud.toUpperCase()} Credentials
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
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold tracking-tight text-white">
                            {selectedCloud ? `${selectedCloud.toUpperCase()} Dashboard` : 'Dashboard'}
                        </h2>
                        {data.accountId && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-in fade-in zoom-in duration-500">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-tighter">Live Account: {data.accountId}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-slate-400 font-medium">Real-time infrastructure and cost analysis.</p>
                </div>
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
                        <CardTitle>Cost Trend (Last 6 Months)</CardTitle>
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
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>Service Breakdown</CardTitle>
                        {data.accountId && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <span className="text-[10px] font-mono text-blue-300">A/C: {data.accountId}</span>
                            </div>
                        )}
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
                                        formatter={(value) => value < 0.01 ? `$${parseFloat(value).toFixed(6)}` : `$${parseFloat(value).toFixed(2)}`}
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Legend Overlay or Center Text if needed */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold">
                                    {data.totalCost < 1 && data.totalCost > 0
                                        ? `$${data.totalCost.toFixed(4)}`
                                        : `$${data.totalCost.toLocaleString()}`}
                                </span>
                                <span className="text-xs text-slate-400 uppercase tracking-widest">Total</span>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {data.serviceBreakdown.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm text-slate-300 truncate max-w-[120px]">{item.name}</span>
                                    <span className="text-sm font-medium ml-auto">
                                        {item.cost < 0.01 && item.cost > 0 ? `<$0.01` : `$${item.cost.toFixed(2)}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
