import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, Key, Loader2, CheckCircle2, AlertCircle, Globe } from "lucide-react";

export function GCPCredentials() {
    const { currentUser, getIdToken } = useAuth();
    const navigate = useNavigate();

    const [projectId, setProjectId] = useState("demo-gcp-project-123");
    const [serviceAccountKey, setServiceAccountKey] = useState(JSON.stringify({
        "type": "service_account",
        "project_id": "demo-gcp-project-123",
        "private_key_id": "abc123",
        "client_email": "demo@demo-gcp-project-123.iam.gserviceaccount.com",
        "client_id": "123456789"
    }, null, 2));

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
                    if (data.gcpProjectId) setProjectId(data.gcpProjectId);
                    if (data.gcpServiceAccountKey) setServiceAccountKey(data.gcpServiceAccountKey);
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

        if (!projectId.trim() || !serviceAccountKey.trim()) {
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
                    gcpProjectId: projectId.trim(),
                    gcpServiceAccountKey: serviceAccountKey.trim(),
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
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-500/8 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <Globe className="h-5 w-5 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">GCP Credentials</h1>
                            <p className="text-xs text-slate-500">{currentUser?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-lg font-semibold mb-1">Connect Your GCP Account</h2>
                    <p className="text-sm text-slate-400 mb-6">
                        Enter your Project ID and Service Account JSON key content.
                    </p>

                    {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 mb-4 text-sm flex gap-2"><AlertCircle className="h-4 w-4" />{error}</div>}
                    {success && <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3 mb-4 text-sm flex gap-2"><CheckCircle2 className="h-4 w-4" />Saved! Redirecting...</div>}

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Project ID</label>
                            <input type="text" value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm" placeholder="my-gcp-project" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Service Account Key (JSON)</label>
                            <textarea rows={5} value={serviceAccountKey} onChange={(e) => setServiceAccountKey(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm font-mono" placeholder='{ "type": "service_account", ... }' />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => navigate("/")} className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl">Skip</button>
                            <button type="submit" disabled={loading} className="flex-1 bg-red-600 text-white py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Continue"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
