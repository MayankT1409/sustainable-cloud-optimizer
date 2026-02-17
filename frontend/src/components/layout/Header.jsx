import { Bell, Search, User } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-slate-900/80 px-6 backdrop-blur-md">
            <div className="flex flex-1 items-center gap-4">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search services, resources..."
                        className="h-9 w-full rounded-md border border-border bg-slate-950/50 pl-9 pr-4 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-slate-100 placeholder:text-slate-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent animate-pulse"></span>
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 p-[1px]">
                    <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-100" />
                    </div>
                </div>
            </div>
        </header>
    );
}
