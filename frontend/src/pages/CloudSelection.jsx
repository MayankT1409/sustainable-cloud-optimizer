import { useNavigate } from "react-router-dom";
import { useCloud } from "../context/CloudContext";
import { Cloud, Server, Database, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";

export function CloudSelection() {
    const { setSelectedCloud } = useCloud();
    const navigate = useNavigate();

    const handleSelect = (cloud) => {
        setSelectedCloud(cloud);
        navigate("/dashboard");
    };

    const clouds = [
        {
            id: "aws",
            name: "AWS",
            description: "Amazon Web Services",
            icon: Cloud,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            features: ["EC2 Optimization", "Cost Explorer", "Carbon Footprint"]
        },
        {
            id: "azure",
            name: "Azure",
            description: "Microsoft Azure",
            icon: Server, // simplistic icon mapping
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            features: ["VM Optimization", "Cost Management", "Sustainability"]
        },
        {
            id: "gcp",
            name: "GCP",
            description: "Google Cloud Platform",
            icon: Globe,
            color: "text-red-500",
            bg: "bg-red-500/10",
            features: ["Compute Engine", "Billing", "Carbon Footprint"]
        }
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Select Cloud Provider</h1>
                <p className="text-slate-400 text-lg">Choose a cloud platform to optimize and monitor.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-5xl w-full">
                {clouds.map((cloud) => (
                    <Card
                        key={cloud.id}
                        className="cursor-pointer hover:border-primary/50 transition-all duration-300 hover:scale-105"
                        onClick={() => handleSelect(cloud.id)}
                    >
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className={`p-3 rounded-full ${cloud.bg}`}>
                                <cloud.icon className={`h-8 w-8 ${cloud.color}`} />
                            </div>
                            <div>
                                <CardTitle>{cloud.name}</CardTitle>
                                <div className="text-sm text-slate-400">{cloud.description}</div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {cloud.features.map((feature, index) => (
                                    <li key={index} className="flex items-center text-sm text-slate-300">
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-500 mr-2" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
