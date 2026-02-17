import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden relative">
                {/* Background Gradients */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[100px] rounded-full pointer-events-none opacity-20"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent/20 blur-[100px] rounded-full pointer-events-none opacity-20"></div>

                <Header />
                <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {children}
                </main>
            </div>
        </div>
    );
}
