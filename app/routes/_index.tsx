import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { NodeSSH } from "node-ssh";
import invariant from "tiny-invariant";
import { getInstanceState } from "~/functions/getInstanceState";
import { startInstance } from "~/functions/startInstance";
import { stopInstance } from "~/functions/stopInstance";
import CopyIcon from "~/icons/copyIcon";

const instanceId = "i-0524c4fcda582f3ca";

export const meta: MetaFunction = () => {
  return [{ title: "Algemene Server" }, { name: "", content: "" }];
};

export async function loader() {
  const { instance, instanceStateName } = await getInstanceState(instanceId);
  return { instanceStateName, publicDns: instance.PublicDnsName };
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  const fetcher = useFetcher();

  const now = new Date();

  // get the current date and time as a string
  const currentDateTime = now.toLocaleString();

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className=" text-gray-600 flex gap-1 items-center">
        <div>Server State: </div>

        <span className=" font-semibold text-black">
          {loaderData.instanceStateName.toUpperCase()}
        </span>
        <div className=" text-sm"> (Refresh for updated server state)</div>
      </div>

      <div className=" text-sm text-gray-600">
        Last state refresh: {currentDateTime}
      </div>

      <fetcher.Form method="POST" className=" flex gap-2 items-start">
        <button
          disabled={loaderData.instanceStateName !== "stopped"}
          name="_action"
          value={"start"}
          type="submit"
          className=" bg-blue-700 text-white p-1 rounded-sm disabled:bg-gray-400"
        >
          Start
        </button>
        <button
          disabled={
            loaderData.instanceStateName === "pending" ||
            loaderData.instanceStateName === "shutting-down" ||
            loaderData.instanceStateName === "stopped" ||
            loaderData.instanceStateName === "stopping" ||
            loaderData.instanceStateName === "terminated"
          }
          name="_action"
          value={"stop"}
          type="submit"
          className=" bg-red-700 text-white p-1 rounded-sm disabled:bg-gray-400"
        >
          Stop
        </button>

        <button
          name="_action"
          type="submit"
          className=" bg-blue-700 text-white p-1 rounded-sm"
        >
          Refresh
        </button>
      </fetcher.Form>
      {loaderData.instanceStateName === "running" ? (
        <div className="flex gap-2 items-center">
          <div className=" text-gray-600">
            <div className="flex gap-2 items-center">
              <div> Server Code: </div>
              <div className=" text-black">85568392932754852</div>
              <button
                className=" rounded-full hover:bg-gray-200 p-1 flex items-center justify-center active:bg-slate-300"
                onClick={() =>
                  navigator.clipboard.writeText("85568392932754852")
                }
              >
                <CopyIcon />
                Copy
              </button>
            </div>
            <div className=" text-sm">
              (Server is online 4-5 mins after code is displayed)
            </div>
            <div className=" text-sm pt-4">{loaderData.publicDns}</div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "start") {
    await startInstance(instanceId);

    setTimeout(async () => {
      const ssh = new NodeSSH();
      const { instance, instanceStateName } = await getInstanceState(
        instanceId
      );
      if (instanceStateName === "running") {
        invariant(process.env.PRIVATE_KEY, "process.env.PRIVATE_KEY undefined");

        try {
          console.log("ssh connect");
          const connectRes = await ssh.connect({
            host: instance.PublicDnsName,
            username: "ubuntu",
            privateKey: process.env.PRIVATE_KEY,
          });
          connectRes.execCommand(
            'cd ~/.local/share/Steam/steamapps/common/U3DS; pm2 start start.sh --name "UServer";'
          );
          // console.log(res);

          // connectRes.withShell()

          // const shell = await connectRes.requestShell();
          // console.log(shell);
        } catch (e) {
          console.log(e);
        }
      }
    }, 10000);
  } else if (action === "stop") {
    await stopInstance(instanceId);
  }

  return null;
}
