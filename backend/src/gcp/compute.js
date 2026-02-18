// import { InstancesClient } from "@google-cloud/compute";

export async function getInstances(projectId, zone = 'us-central1-a') {
    try {
        // const instancesClient = new InstancesClient();
        const request = {
            project: projectId,
            zone: zone,
        };

        // const [instances] = await instancesClient.list(request);

        throw new Error("Demo mode: Skipping GCP API call");

        const details = []; // instances.map(...)

        // const details = instances.map(instance => ({
        //     id: instance.id,
        //     name: instance.name,
        //     type: instance.machineType,
        //     zone: instance.zone,
        //     state: instance.status,
        //     launchTime: instance.creationTimestamp,
        // }));

        return {
            count: 0, // details.length,
            details: []
        };
    } catch (error) {
        console.warn("GCP API failed or credentials missing, returning mock data for demo:", error.message);
        // Mock data
        return {
            count: 4,
            details: [
                { id: "123456789", name: "gcp-app-server", type: "e2-medium", zone: "us-central1-a", state: "RUNNING", launchTime: new Date().toISOString() },
                { id: "987654321", name: "gcp-db-primary", type: "n2-standard-4", zone: "us-central1-b", state: "RUNNING", launchTime: new Date().toISOString() },
                { id: "555555555", name: "gcp-worker", type: "e2-micro", zone: "us-central1-a", state: "STOPPED", launchTime: new Date().toISOString() },
                { id: "444444444", name: "gcp-analytics", type: "c2-standard-8", zone: "us-east1-c", state: "RUNNING", launchTime: new Date().toISOString() },
            ]
        };
    }
}
