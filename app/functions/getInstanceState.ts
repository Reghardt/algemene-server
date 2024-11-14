import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import invariant from "tiny-invariant";
import { client } from "~/services/ec2_service";

export async function getInstanceState(instanceId: string) {
  const command = new DescribeInstancesCommand({
    InstanceIds: [instanceId],
  });

  const { Reservations } = await client.send(command);
  invariant(Reservations, "Reservations undefined");
  const reservation = Reservations[0];
  invariant(reservation.Instances, "reservation.Instances undefined");

  invariant(
    reservation.Instances[0].State?.Name,
    "reservation.Instances[0].State?.Name undefined"
  );
  return {
    instance: reservation.Instances[0],
    instanceStateName: reservation.Instances[0].State.Name,
  };
}
