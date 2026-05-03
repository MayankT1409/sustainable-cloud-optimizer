import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CloudContext = createContext();

export function CloudProvider({ children }) {
    const { currentUser, getIdToken } = useAuth();

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

    // Load credentials from backend API
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

        async function loadFromBackend() {
            setCredentialsLoading(true);
            try {
                const token = await getIdToken();
                const res = await fetch("/api/auth/credentials", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAwsRoleArn(data.awsRoleArn || null);
                    setAwsAccountId(data.awsAccountId || null);
                    setAzureSubId(data.azureSubId || null);
                    setAzureTenantId(data.azureTenantId || null);
                    setAzureClientId(data.azureClientId || null);
                    setAzureClientSecret(data.azureClientSecret || null);
                    setGcpProjectId(data.gcpProjectId || null);
                    setGcpServiceAccountKey(data.gcpServiceAccountKey || null);
                }
            } catch (err) {
                console.error("Failed to load cloud credentials:", err);
            } finally {
                setCredentialsLoading(false);
            }
        }

        loadFromBackend();
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
