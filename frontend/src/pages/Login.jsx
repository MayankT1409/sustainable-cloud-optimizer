import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Cloud, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export function Login() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { login, register } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isSignUp) {
                await register(email, password);
                navigate("/aws-credentials");
            } else {
                await login(email, password);
                navigate("/aws-credentials");
            }
        } catch (err) {
            console.error(err);
            if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                setError("Invalid email or password.");
            } else if (err.code === "auth/email-already-in-use") {
                setError("This email is already registered. Please sign in.");
            } else if (err.code === "auth/weak-password") {
                setError("Password must be at least 6 characters.");
            } else if (err.code === "auth/invalid-email") {
                setError("Please enter a valid email address.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background glow effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
                        <Cloud className="h-8 w-8 text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Cloud Optimizer</h1>
                    <p className="text-slate-400 mt-2">
                        {isSignUp ? "Create your account to get started" : "Sign in to your account"}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    {/* Toggle */}
                    <div className="flex bg-slate-800/50 rounded-xl p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(false); setError(""); }}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${!isSignUp
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(true); setError(""); }}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${isSignUp
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder={isSignUp ? "Min. 6 characters" : "Enter your password"}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {isSignUp ? "Creating account..." : "Signing in..."}
                                </>
                            ) : (
                                isSignUp ? "Create Account" : "Sign In"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            {isSignUp ? "Sign in" : "Sign up"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
