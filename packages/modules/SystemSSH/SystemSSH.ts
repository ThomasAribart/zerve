import {
  createZAction,
  createZContainer,
  createZGettable,
  createZStatic,
  FromSchema,
  JSONSchema,
  RequestError,
} from "@zerve/core";
import { writeFile, stat, readdir, readFile, mkdirp, move } from "fs-extra";
import { join } from "path";
import SSHConfig from "ssh-config";
import { SystemCommandsModule } from "../SystemCommands/SystemCommands";

const SSHConfigSchema = {
  type: "object",
  additionalProperties: {
    type: "object",
    additionalProperties: false,
    properties: {
      hostName: { type: "string" },
      user: { type: "string" },
    },
  },
} as const;

function createSystemSSH(commands: SystemCommandsModule) {
  const getSSHConfig = createZGettable(SSHConfigSchema, async () => {
    const configPath = join(process.env.HOME || "", ".ssh/config");
    const sshConfigRaw = await readFile(configPath, { encoding: "utf8" });
    const sshConfig = SSHConfig.parse(sshConfigRaw);
    console.log(JSON.stringify(sshConfig, null, 2));
    const hosts = Object.fromEntries(
      sshConfig
        .filter((entry) => entry.param === "Host")
        .map((hostEntry) => {
          return [
            hostEntry.value,
            {
              hostName: hostEntry.config.find(
                (e: any) => e.param === "HostName" || e.param === "Hostname"
              )?.value,
              user: hostEntry.config.find((e: any) => e.param === "User")
                ?.value,
            },
          ];
        })
    );
    return { hosts };
  });
  const CommandRemote = createZAction({} as const, {} as const, async () => {
    const ssh = await commands.z.commands.getChild("ssh");
    const result = await ssh.call({ args: ["-q", "hades", "uptime"] });
    console.log(result);
    return result.out;
  });
  const SystemSSH = createZContainer({
    SSHConfig: getSSHConfig,
    CommandRemote,
  });
  return SystemSSH;
}

const SystemSSH = {
  createSystemSSH,
};
export default SystemSSH;
