import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import docker2image from "../index.js";
import path from "path";
import fs from "fs";

const { argv } = yargs(hideBin(process.argv))
  .usage("Usage: docker2image -f [Dockerfile] -o [image] [context]")
  .demand(1, 1)
  .demandOption(["o", "t"])
  .describe("f", "Dockerfile to execute")
  .alias("f", "dockerfile")
  .nargs("f", 1)
  .describe("o", "output image")
  .alias("o", "output")
  .nargs("o", 1)
  .describe("t", "temporary directory")
  .alias("t", "tmpdir")
  .nargs("t", 1)
  .boolean("v")
  .describe("v", "enable verbose output")
  .alias("v", "verbose")
  .strict();

// console.log("args =", argv);

const context = path.resolve(argv._[0]);

const findDockerfile = () => {
  if (argv.dockerfile) {
    return path.resolve(argv.dockerfile);
  }

  return path.resolve(context, "Dockerfile");
};

process.nextTick(async () => {
  try {
    const Dockerfile = findDockerfile();
    const targetImage = path.resolve(argv.output);
    const tmpdir = path.resolve(argv.tmpdir);

    await docker2image({
      targetImage,
      Dockerfile,
      context,
      tmpdir
    });
  } catch (ex) {
    console.error(ex.message);
    process.exitCode = -1;
  }
});
