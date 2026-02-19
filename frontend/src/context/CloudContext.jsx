import { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "./AuthContext";

const CloudContext = createContext();

export function CloudProvider({ children }) {
    const { currentUser } = useAuth();

    const [selectedCloud, setSelectedCloud] = useState(() => {
        return localStorage.getItem("selectedCloud") || null;
    });

    const [awsRoleArn, setAwsRoleArn] = useState(null);
    const [awsAccountId, setAwsAccountId] = useState(null);
    const [credentialsLoading, setCredentialsLoading] = useState(false);

    // Load AWS credentials from Firestore when user logs in
    useEffect(() => {
        async function loadCredentials() {
            if (!currentUser) {
                setAwsRoleArn(null);
                setAwsAccountId(null);
                return;
            }
            setCredentialsLoading(true);
            try {
                const docRef = doc(db, "users", currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setAwsRoleArn(data.awsRoleArn || null);
                    setAwsAccountId(data.awsAccountId || null);
                }
            } catch (err) {
                console.error("Failed to load AWS credentials:", err);
            } finally {
                setCredentialsLoading(false);
            }
        }
        loadCredentials();
    }, [currentUser]);

    useEffect(() => {
        if (selectedCloud) {
            localStorage.setItem("selectedCloud", selectedCloud);
        } else {
            localStorage.removeItem("selectedCloud");
        }
    }, [selectedCloud]);

    return (
        <CloudContext.Provider
            value={{
                selectedCloud,
                setSelectedCloud,
                awsRoleArn,
                setAwsRoleArn,
                awsAccountId,
                setAwsAccountId,
                credentialsLoading,
            }}
        >
            {children}
        </CloudContext.Provider>
    );
}

export function useCloud() {
    const context = useContext(CloudContext);
    if (context === undefined) {
        throw new Error("useCloud must be used within a CloudProvider");
    }
    return context;
}
