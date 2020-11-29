import shell from "./shell.js";
import mountLib from "./mount.js";
import copyUtils from "./copy.js";
import fs from "fs";
import path from "path";

const createFat32Filesystem = async ({ blockDevice }) => {
  await shell.exec(`mkfs.fat -I -F 32 "${blockDevice}"`, { "verbose": true });
};

const createExt4Filesystem = async ({ blockDevice }) => {
  await shell.exec(`mkfs.ext4 "${blockDevice}"`, { "verbose": true });
};

const createFilesystem = async ({ blockDevice, fsType }) => {
  switch (fsType) {
  case "fat32": {
    return createFat32Filesystem({ blockDevice });
  }
  case "ext4": {
    return createExt4Filesystem({ blockDevice });
  }
  default: {
    throw new Error(`unknown filesystem type "${fsType}"`);
  }
  }
};

const clearDirectoryContents = async ({ directory }) => {
  const entries = await fs.promises.readdir(directory);
  await Promise.all(entries.map((dir) => {
    return fs.promises.rmdir(path.resolve(directory, dir), { "recursive": true });
  }));
};

const createAndPropagateFilesystem = async ({
  blockDevice,
  fsType,
  sourceDirectory
}) => {
  await createFilesystem({
    blockDevice,
    fsType
  });

  const handle = await mountLib.mount({
    blockDevice,
    "mountPath": "/mnt"
  });

  const targetDirectory = handle.mountPath;

  try {
    const st = await fs.promises.stat(sourceDirectory);
    await fs.promises.chmod(targetDirectory, st.mode);
    await fs.promises.chown(targetDirectory, st.uid, st.gid);
    
    await copyUtils.copyPreservingAttributes({
      sourceDirectory,
      targetDirectory
    });

    await clearDirectoryContents({ "directory": sourceDirectory });
  } finally {
    await handle.umount();
  }
};

export default {
  createFilesystem,
  createAndPropagateFilesystem
};
