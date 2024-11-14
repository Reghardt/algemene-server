import { StopInstancesCommand } from "@aws-sdk/client-ec2";
import { client } from "~/services/ec2_service";

export async function stopInstance(instanceId: string) {
  const command = new StopInstancesCommand({
    InstanceIds: [instanceId],
  });

  try {
    const { StoppingInstances } = await client.send(command);
    if (StoppingInstances) {
      const instanceIdList = StoppingInstances.map(
        (instance) => ` • ${instance.InstanceId}`
      );
      console.log("Stopping instances:");
      console.log(instanceIdList.join("\n"));
    } else {
      console.log("StoppingInstances undefined");
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
