import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Server, Settings, PieChart, LifeBuoy, User, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";

import { useCloud } from "../../context/CloudContext";
import { useAuth } from "../../context/AuthContext";

export function Sidebar() {
    const location = useLocation();
    const { selectedCloud } = useCloud();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const navItems = [
        {
            group: "AWS",
            items: [
                { icon: LayoutDashboard, label: "AWS Dashboard", path: "/aws/dashboard", cloud: 'aws' },
                { icon: Server, label: "AWS Resources", path: "/aws/resources", cloud: 'aws' },
            ]
        },
        {
            group: "Azure",
            items: [
                { icon: LayoutDashboard, label: "Azure Dashboard", path: "/azure/dashboard", cloud: 'azure' },
                { icon: Server, label: "Azure Resources", path: "/azure/resources", cloud: 'azure' },
            ]
        },
        {
            group: "GCP",
            items: [
                { icon: LayoutDashboard, label: "GCP Dashboard", path: "/gcp/dashboard", cloud: 'gcp' },
                { icon: Server, label: "GCP Resources", path: "/gcp/resources", cloud: 'gcp' },
            ]
        },
        {
            group: "System",
            items: [
                { icon: User, label: "Profile", path: "/profile" },
                { icon: Settings, label: "Settings", path: "/settings" },
            ]
        }
    ];

    return (
        <aside className="hidden h-screen w-64 flex-col border-r border-border bg-slate-900/50 backdrop-blur-xl md:flex">
            <div className="flex h-16 items-center px-6 border-b border-border/50">
                <Server className="h-6 w-6 text-primary mr-2" />
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    CloudOpt {selectedCloud ? `(${selectedCloud.toUpperCase()})` : ''}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                {navItems.map((group) => (
                    <div key={group.group} className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3">
                            {group.group}
                        </h3>
                        <nav className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => item.cloud && setSelectedCloud(item.cloud)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                                                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                                        )}
                                    >
                                        <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-400")} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>

            <div className="border-t border-border/50 p-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 transition-colors">
                    <LifeBuoy className="h-5 w-5" />
                    Support
                </button>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
