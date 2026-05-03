import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Key, Hash, Loader2, CheckCircle2, AlertCircle, LogOut, Lock } from "lucide-react";

export function AzureCredentials() {
    const { currentUser, logout, getIdToken } = useAuth();
    const navigate = useNavigate();

    const [subId, setSubId] = useState("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx");
    const [tenantId, setTenantId] = useState("yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy");
    const [clientId, setClientId] = useState("zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz");
    const [clientSecret, setClientSecret] = useState("demo-azure-client-secret-2024");

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadCredentials() {
            if (!currentUser) return;
            try {
                const token = await getIdToken();
                const res = await fetch("/api/auth/credentials", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.azureSubId) setSubId(data.azureSubId);
                    if (data.azureTenantId) setTenantId(data.azureTenantId);
                    if (data.azureClientId) setClientId(data.azureClientId);
                    if (data.azureClientSecret) setClientSecret(data.azureClientSecret);
                }
            } catch (err) {
                console.error("Failed to load credentials:", err);
            } finally {
                setFetching(false);
            }
        }
        loadCredentials();
    }, [currentUser]);

    async function handleSave(e) {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!subId.trim() || !tenantId.trim() || !clientId.trim() || !clientSecret.trim()) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        try {
            const token = await getIdToken();
            const res = await fetch("/api/auth/credentials", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    azureSubId: subId.trim(),
                    azureTenantId: tenantId.trim(),
                    azureClientId: clientId.trim(),
                    azureClientSecret: clientSecret.trim(),
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Save failed");
            }
            setSuccess(true);
            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (err) {
            console.error("Failed to save credentials:", err);
            setError("Failed to save credentials.");
        } finally {
            setLoading(false);
        }
    }

    if (fetching) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-slate-400 animate-pulse flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading your credentials...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Azure Credentials</h1>
                            <p className="text-xs text-slate-500">{currentUser?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-lg font-semibold mb-1">Connect Your Azure Account</h2>
                    <p className="text-sm text-slate-400 mb-6">
                        Enter your Azure Service Principal details to allow Cloud Optimizer to read your account data.
                    </p>

                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 mb-4 text-sm flex gap-2"><AlertCircle className="h-4 w-4" />{error}</div>}
                    {success && <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3 mb-4 text-sm flex gap-2"><CheckCircle2 className="h-4 w-4" />Saved! Redirecting...</div>}

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Subscription ID</label>
                            <input type="text" value={subId} onChange={(e) => setSubId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Tenant ID</label>
                            <input type="text" value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Client ID</label>
                            <input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Client Secret</label>
                            <input type="password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm" placeholder="••••••••••••••••" />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => navigate("/")} className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl">Skip</button>
                            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Continue"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
