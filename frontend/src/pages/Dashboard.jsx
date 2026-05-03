import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { DollarSign, TrendingDown, Leaf, Activity, AlertTriangle, Cloud, Server, Globe } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useCloud } from "../context/CloudContext";
import { useAuth } from "../context/AuthContext";

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
    const { getIdToken } = useAuth();
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

    const [cloudSummaries, setCloudSummaries] = useState({
        aws: null,
        azure: null,
        gcp: null
    });
    const [loading, setLoading] = useState(true);

    const downloadReport = async () => {
        try {
            const token = await getIdToken();
            const response = await fetch('/api/reports/generate', {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ reportData: data })
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ESG_Report.pdf';
                a.click();
            }
        } catch (err) {
            console.error("Failed to download report:", err);
        }
    };

    useEffect(() => {
        async function fetchCloudSummary(provider, body) {
            const endpoints = {
                aws: '/api/aws/summary',
                azure: '/api/azure/summary',
                gcp: '/api/gcp/summary'
            };

            try {
                const response = await fetch(endpoints[provider], {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                if (response.ok) return await response.json();
            } catch (e) {
                console.error(`Failed to fetch ${provider} summary:`, e);
            }
            return null;
        }

        async function fetchData() {
            setLoading(true);
            try {
                if (selectedCloud) {
                    let body = {};
                    if (selectedCloud === 'aws') body = { roleArn: awsRoleArn };
                    if (selectedCloud === 'azure') body = { subscriptionId: azureSubId, tenantId: azureTenantId, clientId: azureClientId, clientSecret: azureClientSecret };
                    if (selectedCloud === 'gcp') body = { projectId: gcpProjectId, serviceAccountKey: gcpServiceAccountKey };

                    const result = await fetchCloudSummary(selectedCloud, body);
                    if (result) {
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
                            totalCost: parseFloat(result.totalCost6Months || result.monthlyCost || 0),
                            savingsPotential: (result.totalCost6Months * 0.15) || 0,
                            activeServices: result.costBreakdown ? Object.keys(result.costBreakdown).length : (result.activeInstances || 0),
                            carbonFootprint: result.estimatedCO2 || 0,
                            costTrend: result.costTrend ? result.costTrend.map(t => ({
                                date: new Date(t.period).toLocaleDateString('en-US', { month: 'short' }),
                                cost: parseFloat(t.cost)
                            })) : [],
                            serviceBreakdown: breakdown
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        }

        if (!credentialsLoading) {
            fetchData();
        }
    }, [selectedCloud, awsRoleArn, azureSubId, gcpProjectId, credentialsLoading]);

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

    if (loading || credentialsLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-slate-400 animate-pulse">Loading dashboard data...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold tracking-tight text-white underline decoration-primary/30 decoration-4 underline-offset-8">
                            {selectedCloud ? `${selectedCloud.toUpperCase()} Dashboard` : 'Multi-Cloud Overview'}
                        </h2>
                        {data.accountId && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <span className="text-[10px] font-mono text-emerald-400 font-bold">Live Account: {data.accountId}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-slate-400 font-medium mt-2">
                        Real-time infrastructure and sustainability analysis.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={downloadReport}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg"
                    >
                        <Leaf className="h-4 w-4" />
                        Generate ESG Report
                    </button>
                    <button 
                        onClick={() => navigate('/optimization')}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg"
                    >
                        <Activity className="h-4 w-4" />
                        AI Optimization
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="hover:border-slate-700 transition-all hover:scale-[1.02] duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold text-white">{stat.value}</div>
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
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                    <Area type="monotone" dataKey="cost" stroke="#3b82f6" fillOpacity={0.3} fill="#3b82f6" />
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
                        <div className="h-[300px] w-full">
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
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
