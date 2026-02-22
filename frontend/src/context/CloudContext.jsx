import { createContext, useContext, useState, useEffect } from "react";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
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

    // Azure credentials
    const [azureSubId, setAzureSubId] = useState(null);
    const [azureTenantId, setAzureTenantId] = useState(null);
    const [azureClientId, setAzureClientId] = useState(null);
    const [azureClientSecret, setAzureClientSecret] = useState(null);

    // GCP credentials
    const [gcpProjectId, setGcpProjectId] = useState(null);
    const [gcpServiceAccountKey, setGcpServiceAccountKey] = useState(null);

    const [credentialsLoading, setCredentialsLoading] = useState(false);

    // Listen to credentials from Firestore in real-time
    useEffect(() => {
        if (!currentUser) {
            setAwsRoleArn(null);
            setAwsAccountId(null);
            setAzureSubId(null);
            setAzureTenantId(null);
            setAzureClientId(null);
            setAzureClientSecret(null);
            setGcpProjectId(null);
            setGcpServiceAccountKey(null);
            return;
        }

        setCredentialsLoading(true);
        const docRef = doc(db, "users", currentUser.uid);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // AWS
                setAwsRoleArn(data.awsRoleArn || null);
                setAwsAccountId(data.awsAccountId || null);
                // Azure
                setAzureSubId(data.azureSubId || null);
                setAzureTenantId(data.azureTenantId || null);
                setAzureClientId(data.azureClientId || null);
                setAzureClientSecret(data.azureClientSecret || null);
                // GCP
                setGcpProjectId(data.gcpProjectId || null);
                setGcpServiceAccountKey(data.gcpServiceAccountKey || null);
            }
            setCredentialsLoading(false);
        }, (err) => {
            console.error("Failed to sync cloud credentials:", err);
            setCredentialsLoading(false);
        });

        return () => unsubscribe();
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
                azureSubId,
                setAzureSubId,
                azureTenantId,
                setAzureTenantId,
                azureClientId,
                setAzureClientId,
                azureClientSecret,
                setAzureClientSecret,
                gcpProjectId,
                setGcpProjectId,
                gcpServiceAccountKey,
                setGcpServiceAccountKey,
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
