import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCloud } from "../context/CloudContext";
import {
    User, Mail, Shield, Key, Hash,
    Loader2, CheckCircle2, AlertCircle,
    Save, Cloud, Server, Globe, LogOut
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";

export function Profile() {
    const { currentUser, logout, getIdToken } = useAuth();
    const {
        awsRoleArn, awsAccountId, setAwsRoleArn, setAwsAccountId,
        azureSubId, azureTenantId, azureClientId, azureClientSecret,
        setAzureSubId, setAzureTenantId, setAzureClientId, setAzureClientSecret,
        gcpProjectId, gcpServiceAccountKey, setGcpProjectId, setGcpServiceAccountKey,
        credentialsLoading
    } = useCloud();

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    // Local form states
    const [awsData, setAwsData] = useState({ roleArn: "", accountId: "" });
    const [azureData, setAzureData] = useState({ subId: "", tenantId: "", clientId: "", clientSecret: "" });
    const [gcpData, setGcpData] = useState({ projectId: "", serviceAccountKey: "" });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // Sync cloud context to local state
    useEffect(() => {
        if (!credentialsLoading) {
            setAwsData({ roleArn: awsRoleArn || "", accountId: awsAccountId || "" });
            setAzureData({
                subId: azureSubId || "",
                tenantId: azureTenantId || "",
                clientId: azureClientId || "",
                clientSecret: azureClientSecret || ""
            });
            setGcpData({
                projectId: gcpProjectId || "",
                serviceAccountKey: gcpServiceAccountKey || ""
            });
        }
    }, [credentialsLoading, awsRoleArn, awsAccountId, azureSubId, azureTenantId, azureClientId, azureClientSecret, gcpProjectId, gcpServiceAccountKey]);

    const handleSave = async (provider) => {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const token = await getIdToken();
            let payload = {};

            if (provider === "aws") {
                payload = { awsRoleArn: awsData.roleArn.trim(), awsAccountId: awsData.accountId.trim() };
                setAwsRoleArn(awsData.roleArn.trim());
                setAwsAccountId(awsData.accountId.trim());
            } else if (provider === "azure") {
                payload = {
                    azureSubId: azureData.subId.trim(),
                    azureTenantId: azureData.tenantId.trim(),
                    azureClientId: azureData.clientId.trim(),
                    azureClientSecret: azureData.clientSecret.trim()
                };
                setAzureSubId(azureData.subId.trim());
                setAzureTenantId(azureData.tenantId.trim());
                setAzureClientId(azureData.clientId.trim());
                setAzureClientSecret(azureData.clientSecret.trim());
            } else if (provider === "gcp") {
                payload = {
                    gcpProjectId: gcpData.projectId.trim(),
                    gcpServiceAccountKey: gcpData.serviceAccountKey.trim()
                };
                setGcpProjectId(gcpData.projectId.trim());
                setGcpServiceAccountKey(gcpData.serviceAccountKey.trim());
            }

            const res = await fetch("/api/auth/credentials", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Save failed");
            }

            setSuccess(`${provider.toUpperCase()} credentials updated successfully!`);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Failed to save credentials:", err);
            setError("Failed to update credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (credentialsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Your Profile</h2>
                    <p className="text-slate-400">Manage your account information and cloud credentials.</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-900/50 px-4 py-2 rounded-xl transition-all font-medium"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>

            {/* Account Info */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Account Details</CardTitle>
                        <p className="text-sm text-slate-400">Basic information about your account.</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                        <Mail className="h-5 w-5 text-slate-500" />
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Email Address</p>
                            <p className="text-slate-100">{currentUser?.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Global Error/Success */}
            {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-4 text-sm animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    {success}
                </div>
            )}

            {/* AWS Section */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-full">
                            <Cloud className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                            <CardTitle>AWS Credentials</CardTitle>
                            <p className="text-sm text-slate-400">Configure your AWS IAM Role access.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleSave("aws")}
                        disabled={loading}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        Update AWS
                    </button>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Role ARN</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                                <input
                                    type="text"
                                    value={awsData.roleArn}
                                    onChange={(e) => setAwsData({ ...awsData, roleArn: e.target.value })}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                                    placeholder="arn:aws:iam::..."
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Account ID</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                                <input
                                    type="text"
                                    value={awsData.accountId}
                                    onChange={(e) => setAwsData({ ...awsData, accountId: e.target.value })}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                                    placeholder="123456789012"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Azure Section */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full">
                            <Server className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <CardTitle>Azure Credentials</CardTitle>
                            <p className="text-sm text-slate-400">Configure your Azure Service Principal.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleSave("azure")}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        Update Azure
                    </button>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Subscription ID</label>
                            <input
                                type="text"
                                value={azureData.subId}
                                onChange={(e) => setAzureData({ ...azureData, subId: e.target.value })}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Tenant ID</label>
                            <input
                                type="text"
                                value={azureData.tenantId}
                                onChange={(e) => setAzureData({ ...azureData, tenantId: e.target.value })}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Client ID</label>
                            <input
                                type="text"
                                value={azureData.clientId}
                                onChange={(e) => setAzureData({ ...azureData, clientId: e.target.value })}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Client Secret</label>
                            <input
                                type="password"
                                value={azureData.clientSecret}
                                onChange={(e) => setAzureData({ ...azureData, clientSecret: e.target.value })}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="••••••••••••••••"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* GCP Section */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-full">
                            <Globe className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <CardTitle>GCP Credentials</CardTitle>
                            <p className="text-sm text-slate-400">Configure your GCP Project access.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleSave("gcp")}
                        disabled={loading}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        Update GCP
                    </button>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Project ID</label>
                            <input
                                type="text"
                                value={gcpData.projectId}
                                onChange={(e) => setGcpData({ ...gcpData, projectId: e.target.value })}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Service Account Key (JSON)</label>
                            <textarea
                                rows={4}
                                value={gcpData.serviceAccountKey}
                                onChange={(e) => setGcpData({ ...gcpData, serviceAccountKey: e.target.value })}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500 font-mono"
                                placeholder='{ "type": "service_account", ... }'
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
