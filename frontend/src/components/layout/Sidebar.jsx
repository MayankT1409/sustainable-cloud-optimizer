import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Server, Settings, PieChart, LifeBuoy } from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Server, label: "EC2 Optimization", path: "/ec2" },
    { icon: PieChart, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <aside className="hidden h-screen w-64 flex-col border-r border-border bg-slate-900/50 backdrop-blur-xl md:flex">
            <div className="flex h-16 items-center px-6 border-b border-border/50">
                <Server className="h-6 w-6 text-primary mr-2" />
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    CloudOpt
                </span>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-slate-400")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-border/50 p-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 transition-colors">
                    <LifeBuoy className="h-5 w-5" />
                    Support
                </button>
            </div>
        </aside>
    );
}
