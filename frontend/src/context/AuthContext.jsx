import { createContext, useContext, useState, useEffect } from "react";
import { AuthenticationDetails, CognitoUser, CognitoUserAttribute } from "amazon-cognito-identity-js";
import { userPool } from "../lib/cognito";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for Demo Mode first
        const isDemo = localStorage.getItem("isDemo");
        const savedUser = localStorage.getItem("user");
        if (isDemo === "true" && savedUser) {
            setCurrentUser(JSON.parse(savedUser));
            setLoading(false);
            return;
        }

        const user = userPool.getCurrentUser();
        if (user) {
            user.getSession((err, session) => {
                if (err || !session.isValid()) {
                    setCurrentUser(null);
                } else {
                    user.getUserAttributes((err, attributes) => {
                        if (err) {
                            setCurrentUser(null);
                        } else {
                            const userObj = {
                                uid: user.getUsername(),
                                email: attributes.find(a => a.Name === "email")?.Value,
                                role: attributes.find(a => a.Name === "custom:role")?.Value || "User",
                                tenant_id: attributes.find(a => a.Name === "custom:tenant_id")?.Value || user.getUsername(),
                            };
                            setCurrentUser(userObj);
                        }
                        setLoading(false);
                    });
                    return;
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    function register(email, password) {
        return new Promise((resolve, reject) => {
            const attributeList = [
                new CognitoUserAttribute({ Name: "email", Value: email }),
            ];
            userPool.signUp(email, password, attributeList, null, (err, result) => {
                if (err) reject(err);
                else resolve(result.user);
            });
        });
    }

    function login(email, password) {
        const lowerEmail = email.toLowerCase().trim();
        // 🚀 AGGRESSIVE DEMO BYPASS
        if (lowerEmail === "demo@example.com") {
            const demoUser = {
                uid: "demo-user-123",
                email: "demo@example.com",
                role: "Admin",
                tenant_id: "demo-tenant-456",
            };
            setCurrentUser(demoUser);
            localStorage.setItem("isDemo", "true");
            localStorage.setItem("user", JSON.stringify(demoUser));
            return Promise.resolve(demoUser);
        }

        return new Promise((resolve, reject) => {
            const user = new CognitoUser({ Username: email, Pool: userPool });
            const authDetails = new AuthenticationDetails({ Username: email, Password: password });

            user.authenticateUser(authDetails, {
                onSuccess: (result) => {
                    user.getUserAttributes((err, attributes) => {
                        const userObj = {
                            uid: user.getUsername(),
                            email: attributes.find(a => a.Name === "email")?.Value,
                            role: attributes.find(a => a.Name === "custom:role")?.Value || "User",
                            tenant_id: attributes.find(a => a.Name === "custom:tenant_id")?.Value || user.getUsername(),
                        };
                        setCurrentUser(userObj);
                        resolve(result);
                    });
                },
                onFailure: (err) => {
                    console.warn("Cognito Login Failed, attempting demo fallback...");
                    reject(err);
                },
            });
        });
    }

    function logout() {
        const user = userPool.getCurrentUser();
        if (user) {
            user.signOut();
        }
        setCurrentUser(null);
        localStorage.removeItem("isDemo");
        localStorage.removeItem("user");
    }

    async function getIdToken() {
        if (localStorage.getItem("isDemo") === "true") {
            return "demo-token-xyz";
        }
        return new Promise((resolve, reject) => {
            const user = userPool.getCurrentUser();
            if (!user) return resolve(null);
            user.getSession((err, session) => {
                if (err) reject(err);
                else resolve(session.getIdToken().getJwtToken());
            });
        });
    }

    const value = {
        currentUser,
        login,
        register,
        logout,
        getIdToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
