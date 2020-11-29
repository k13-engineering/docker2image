import path from "path";
import mountLib from "./mount.js";
import shell from "./shell.js";

const prepareBasicUnixEnv = async ({
  rootDir
}) => {
  await mountLib.rbind({
    "sourcePath": "/proc",
    "mountPath": path.resolve(rootDir, "proc")
  });

  await mountLib.rbind({
    "sourcePath": "/sys",
    "mountPath": path.resolve(rootDir, "sys")
  });

  await mountLib.rbind({
    "sourcePath": "/dev",
    "mountPath": path.resolve(rootDir, "dev")
  });
};

const createChrootEnvironment = async ({ rootDir }) => {
  await prepareBasicUnixEnv({
    rootDir
  });

  const execute = async ({ command }) => {
    await shell.exec(`chroot /mnt sh -c "${command}"`, {
      "verbose": true
    });
  };

  return {
    execute
  };
};

export default {
  createChrootEnvironment
};
