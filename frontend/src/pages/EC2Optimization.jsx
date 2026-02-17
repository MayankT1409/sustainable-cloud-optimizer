import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Search, Filter, MoreVertical, Cpu, PlayCircle, StopCircle, RefreshCw } from "lucide-react";

export function EC2Optimization() {
    const [instances, setInstances] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    async function fetchInstances() {
        setLoading(true);
        try {
            const response = await fetch('/api/aws/instances');
            const data = await response.json();
            setInstances(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch instances:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchInstances();
    }, []);

    const filteredInstances = instances.filter(instance =>
        (instance.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (instance.id || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusVariant = (status) => {
        switch (status) {
            case "running": return "success";
            case "stopped": return "warning";
            case "terminated": return "danger";
            default: return "neutral";
        }
    };

    const getRecommendationColor = (rec) => {
        switch (rec) {
            case "OPTIMIZED": return "text-emerald-500 bg-emerald-500/10";
            case "TERMINATE": return "text-red-500 bg-red-500/10";
            case "UPGRADE": return "text-blue-500 bg-blue-500/10";
            case "STOPPED": return "text-slate-500 bg-slate-500/10";
            default: return "text-slate-400";
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">EC2 Optimization</h2>
                    <p className="text-slate-400">Manage and optimize your EC2 instances.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchInstances} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/25">
                        <RefreshCw className="h-4 w-4" />
                        Scan Now
                    </button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search instances..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-9 w-full rounded-md border border-border bg-slate-950/50 pl-9 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-slate-100 placeholder:text-slate-500"
                        />
                    </div>
                    <button className="p-2 text-slate-400 hover:bg-slate-800 rounded-md transition-colors">
                        <Filter className="h-4 w-4" />
                    </button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="p-8 text-center text-slate-400 animate-pulse">Scanning EC2 instances...</div>
                    ) : filteredInstances.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No instances found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3">Instance Name / ID</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Region</th>
                                        <th className="px-4 py-3">State</th>
                                        <th className="px-4 py-3">Launch Time</th>
                                        <th className="px-4 py-3">Recommendation</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInstances.map((instance) => (
                                        <tr key={instance.id} className="border-b border-border/50 hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-100">{instance.name}</div>
                                                <div className="text-xs text-slate-500">{instance.id}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">{instance.type}</td>
                                            <td className="px-4 py-3 text-slate-300">{instance.region}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={getStatusVariant(instance.state)}>
                                                    {instance.state}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400">
                                                {new Date(instance.launchTime).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${getRecommendationColor("OPTIMIZED")}`}>
                                                    OPTIMIZED
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors">
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
