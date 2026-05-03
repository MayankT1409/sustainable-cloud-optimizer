import { EC2Client, StopInstancesCommand, ModifyInstanceAttributeCommand } from "@aws-sdk/client-ec2";

/**
 * Lambda Handler for Cloud Automation
 * Triggered by Step Functions or EventBridge
 */
export const handler = async (event) => {
    const { action, resourceId, region, tenantId } = event;
    const client = new EC2Client({ region });

    try {
        console.log(`Executing ${action} on ${resourceId} in ${region} for tenant ${tenantId}`);
        
        switch (action) {
            case "STOP_IDLE":
                const stopCommand = new StopInstancesCommand({ InstanceIds: [resourceId] });
                await client.send(stopCommand);
                return { status: "SUCCESS", message: `Instance ${resourceId} stopped.` };

            case "RESIZE_EC2":
                const { newType } = event;
                const resizeCommand = new ModifyInstanceAttributeCommand({
                    InstanceId: resourceId,
                    InstanceType: { Value: newType }
                });
                await client.send(resizeCommand);
                return { status: "SUCCESS", message: `Instance ${resourceId} resized to ${newType}.` };

            default:
                throw new Error(`Unsupported action: ${action}`);
        }
    } catch (err) {
        console.error("Automation Error:", err);
        return { status: "FAILED", error: err.message };
    }
};
