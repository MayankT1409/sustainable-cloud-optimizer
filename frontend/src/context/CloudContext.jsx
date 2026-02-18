import { createContext, useContext, useState, useEffect } from "react";

const CloudContext = createContext();

export function CloudProvider({ children }) {
    const [selectedCloud, setSelectedCloud] = useState(() => {
        return localStorage.getItem("selectedCloud") || null;
    });

    useEffect(() => {
        if (selectedCloud) {
            localStorage.setItem("selectedCloud", selectedCloud);
        } else {
            localStorage.removeItem("selectedCloud");
        }
    }, [selectedCloud]);

    return (
        <CloudContext.Provider value={{ selectedCloud, setSelectedCloud }}>
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
