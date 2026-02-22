import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Shield, Key, Hash, Loader2, CheckCircle2, AlertCircle, LogOut } from "lucide-react";

export function AWSCredentials() {
    const { currentUser, logout, getIdToken } = useAuth();
    const navigate = useNavigate();

    const [roleArn, setRoleArn] = useState("");
    const [accountId, setAccountId] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Load existing credentials from Firestore
    useEffect(() => {
        async function loadCredentials() {
            if (!currentUser) return;
            try {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.awsRoleArn) setRoleArn(data.awsRoleArn);
                    if (data.awsAccountId) setAccountId(data.awsAccountId);
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

        if (!roleArn.trim()) {
            setError("Role ARN is required.");
            return;
        }
        if (!roleArn.startsWith("arn:aws:iam::")) {
            setError("Role ARN must start with 'arn:aws:iam::'");
            return;
        }

        setLoading(true);
        try {
            // Save to Firestore
            const docRef = doc(db, "users", currentUser.uid);
            await setDoc(docRef, {
                email: currentUser.email,
                awsRoleArn: roleArn.trim(),
                awsAccountId: accountId.trim(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });

            setSuccess(true);
            setTimeout(() => navigate("/"), 1500);
        } catch (err) {
            console.error("Failed to save credentials:", err);
            setError("Failed to save credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        await logout();
        navigate("/login");
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
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">AWS Credentials</h1>
                            <p className="text-xs text-slate-500">{currentUser?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>

                {/* Card */}
                <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-1">Connect Your AWS Account</h2>
                        <p className="text-sm text-slate-400">
                            Enter your AWS Role ARN to allow Cloud Optimizer to read your account data.
                            Your credentials are stored securely and only used for your account.
                        </p>
                    </div>

                    {/* Info box */}
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-6">
                        <p className="text-xs text-blue-300 font-medium mb-1">How to get your Role ARN?</p>
                        <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
                            <li>Go to AWS Console → IAM → Roles</li>
                            <li>Find or create a role with <code className="text-orange-300">ReadOnlyAccess</code> policy</li>
                            <li>Copy the Role ARN (starts with <code className="text-orange-300">arn:aws:iam::</code>)</li>
                        </ol>
                    </div>

                    {/* Error / Success */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg px-4 py-3 mb-4 text-sm">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            Credentials saved! Redirecting...
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Role ARN <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={roleArn}
                                    onChange={(e) => setRoleArn(e.target.value)}
                                    placeholder="arn:aws:iam::123456789012:role/MyRole"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Account ID <span className="text-slate-500 text-xs">(optional)</span>
                            </label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={accountId}
                                    onChange={(e) => setAccountId(e.target.value)}
                                    placeholder="123456789012"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                            >
                                Skip for now
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save & Continue"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
