import { EC2Client } from "@aws-sdk/client-ec2";
import invariant from "tiny-invariant";

invariant(process.env.ACCESS_KEY_ID);
invariant(process.env.SECRET_ACCESS_KEY);

export const client = new EC2Client({
  region: "af-south-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});
