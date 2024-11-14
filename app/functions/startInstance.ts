import { StartInstancesCommand } from "@aws-sdk/client-ec2";
import { client } from "~/services/ec2_service";

export async function startInstance(instanceId: string) {
  const command = new StartInstancesCommand({
    InstanceIds: [instanceId],
  });

  try {
    const { StartingInstances } = await client.send(command);
    if (StartingInstances) {
      const instanceIdList = StartingInstances.map(
        (instance) => ` • ${instance.InstanceId}`
      );
      console.log("Starting instances:");
      console.log(instanceIdList.join("\n"));
    } else {
      console.log("StartingInstances undefined");
    }
  } catch (caught) {
    if (
      caught instanceof Error &&
      caught.name === "InvalidInstanceID.NotFound"
    ) {
      console.warn(`${caught.message}`);
    } else {
      throw caught;
    }
  }
}
