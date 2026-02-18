import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Search, MoreVertical, RefreshCw } from "lucide-react";
import { useCloud } from "../context/CloudContext";

export function GCPCompute() {
    const [instances, setInstances] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const { selectedCloud } = useCloud();

    async function fetchInstances() {
        setLoading(true);
        try {
            const response = await fetch('/api/gcp/instances', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });

            const data = await response.json();
            setInstances(data);

        } catch (error) {
            console.error("Failed to fetch GCP instances:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (selectedCloud === 'gcp') {
            fetchInstances();
        }
    }, [selectedCloud]);

    const filteredInstances = instances.filter(ins =>
        (ins.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ins.id || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusVariant = (status) => {
        if (status === "RUNNING") return "success";
        if (status === "STOPPED" || status === "TERMINATED") return "danger";
        return "neutral";
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">GCP Compute Optimization</h2>
                    <p className="text-slate-400">Manage and optimize your Google Cloud instances.</p>
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
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="p-8 text-center text-slate-400 animate-pulse">Scanning GCP instances...</div>
                    ) : filteredInstances.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No instances found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Zone</th>
                                        <th className="px-4 py-3">State</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInstances.map((ins) => (
                                        <tr key={ins.id} className="border-b border-border/50 hover:bg-slate-800/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-100">{ins.name}</td>
                                            <td className="px-4 py-3 text-slate-300">{ins.type}</td>
                                            <td className="px-4 py-3 text-slate-300">{ins.zone}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={getStatusVariant(ins.state)}>
                                                    {ins.state}
                                                </Badge>
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
