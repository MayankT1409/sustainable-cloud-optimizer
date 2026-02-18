// import { ComputeManagementClient } from "@azure/arm-compute";
// import { DefaultAzureCredential } from "@azure/identity";
// import { SubscriptionClient } from "@azure/arm-resources";

export async function getVMs(subscriptionId) {
    try {
        // const credential = new DefaultAzureCredential();
        // const client = new ComputeManagementClient(credential, subscriptionId);

        const vms = [];
        // for await (const vm of client.virtualMachines.listAll()) {
        //     vms.push({
        //         id: vm.id,
        //         name: vm.name,
        //         type: vm.hardwareProfile?.vmSize,
        //         location: vm.location,
        //         state: vm.instanceView?.statuses?.find(s => s.code?.startsWith("PowerState"))?.displayStatus || "Unknown",
        //         launchTime: null, // Azure doesn't provide launch time directly in listAll
        //     });
        // }

        throw new Error("Demo mode: Skipping Azure API call");

        return {
            count: vms.length,
            details: vms
        };
    } catch (error) {
        console.warn("Azure API failed or credentials missing, returning mock data for demo:", error.message);
        // Mock data for demo purposes
        return {
            count: 5,
            details: [
                { id: "vm-1", name: "azure-db-prod", type: "Standard_D2s_v3", location: "eastus", state: "VM running", launchTime: new Date().toISOString() },
                { id: "vm-2", name: "azure-web-1", type: "Standard_B2s", location: "eastus", state: "VM running", launchTime: new Date().toISOString() },
                { id: "vm-3", name: "azure-web-2", type: "Standard_B2s", location: "eastus", state: "VM deallocated", launchTime: new Date().toISOString() },
                { id: "vm-4", name: "azure-worker-1", type: "Standard_F2", location: "westus", state: "VM running", launchTime: new Date().toISOString() },
                { id: "vm-5", name: "azure-cache", type: "Standard_A1_v2", location: "westus", state: "VM running", launchTime: new Date().toISOString() },
            ]
        };
    }
}
