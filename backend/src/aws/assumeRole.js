import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

const stsClient = new STSClient({
  region: "ap-south-1", // your SaaS account region
});

export async function assumeCustomerRole(roleArn) {
  const command = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: "SCO-Session",
    DurationSeconds: 900, // 15 minutes
  });

  const response = await stsClient.send(command);

  return {
    accessKeyId: response.Credentials.AccessKeyId,
    secretAccessKey: response.Credentials.SecretAccessKey,
    sessionToken: response.Credentials.SessionToken,
  };
}
