import {
  createZAction,
  createZContainer,
  createZStatic,
  RequestError,
} from "@zerve/core";
import { writeFile, stat, readdir, readFile, mkdirp, move } from "fs-extra";
import { join } from "path";

function ensureNoPathEscape(path: string) {
  if (path.match(/^\.\./) || path.match(/\/\.\./)) {
    throw new RequestError(
      "PathValidationError",
      `Cannot use .. within your path`,
      { path }
    );
  }
}

export type SystemFilesModule = ReturnType<typeof createSystemFiles>;

function createSystemFiles<FilesRoot extends string>(filesRoot: FilesRoot) {
  const WriteFile = createZAction(
    {
      type: "object",
      required: ["path", "value"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
        value: { type: "string" },
      },
    } as const,
    async ({ path, value }) => {
      ensureNoPathEscape(path);
      await writeFile(join(filesRoot, path), value);
    }
  );

  const WriteJSON = createZAction(
    {
      type: "object",
      required: ["path", "value"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
        value: {},
      },
    } as const,
    async ({ path, value }) => {
      ensureNoPathEscape(path);
      const fullPath = join(filesRoot, path);
      await writeFile(fullPath, JSON.stringify(value));
    }
  );

  const ReadFile = createZAction(
    {
      type: "object",
      required: ["path"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
      },
    } as const,
    async ({ path }) => {
      ensureNoPathEscape(path);
      const fullPath = join(filesRoot, path);
      await readFile(fullPath, { encoding: "utf8" });
    }
  );

  const ReadJSON = createZAction(
    {
      type: "object",
      required: ["path"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
      },
    } as const,
    async ({ path }) => {
      ensureNoPathEscape(path);
      const fullPath = join(filesRoot, path);
      const data = await readFile(fullPath, { encoding: "utf8" });
      return JSON.parse(data);
    }
  );

  const ReadDir = createZAction(
    {
      type: "object",
      required: ["path"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
      },
    } as const,
    async ({ path }) => {
      ensureNoPathEscape(path);
      const fullPath = join(filesRoot, path);
      const result = await readdir(fullPath);
      return result;
    }
  );

  const MakeDir = createZAction(
    {
      type: "object",
      required: ["path"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
      },
    } as const,
    async ({ path }) => {
      ensureNoPathEscape(path);
      const fullPath = join(filesRoot, path);
      await mkdirp(fullPath);
    }
  );

  const Move = createZAction(
    {
      type: "object",
      required: ["path"],
      additionalProperties: false,
      properties: {
        from: { type: "string" },
        to: { type: "string" },
      },
    } as const,
    async ({ from, to }) => {
      ensureNoPathEscape(from);
      ensureNoPathEscape(to);
      const fullFrom = join(filesRoot, from);
      const fullTo = join(filesRoot, to);
      await move(fullFrom, fullTo);
    }
  );

  const Stat = createZAction(
    {
      type: "object",
      required: ["path"],
      additionalProperties: false,
      properties: {
        path: { type: "string" },
      },
    } as const,
    async ({ path }) => {
      ensureNoPathEscape(path);
      const fullPath = join(filesRoot, path);
      const stats = await stat(fullPath);
      return { path, isDirectory: stats.isDirectory() };
    }
  );

  return createZContainer({
    WriteFile,
    ReadFile,
    Stat,
    ReadDir,
    MakeDir,
    WriteJSON,
    ReadJSON,
    Move,
    Path: createZStatic(filesRoot),
  });
}

const SystemFiles = {
  createSystemFiles,
} as const;

export default SystemFiles;
