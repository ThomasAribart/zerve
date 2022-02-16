import { join } from "path";

import { createApp } from "./src/Server";

const port = process.env.PORT ? Number(process.env.PORT) : 3888;
const overrideDataDir =
  process.env.ZERVE_DATA_DIR ||
  (process.env.NODE_ENV === "dev"
    ? join(process.cwd(), "dev-data")
    : undefined);

createApp(port, overrideDataDir).catch((e) => {
  console.error("Error Starting App");
  console.error(e);
  process.exit(1);
});