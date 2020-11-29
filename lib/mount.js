import path from "path";
import shell from "./shell.js";

const isPathContained = ({ folder, filename }) => {
  const relative = path.relative(folder, filename);
  return Boolean(relative) && relative.split(path.sep)[0] !== ".." && !path.isAbsolute(relative);
};

const findLastIndex = (arr, fn) => {
  const index = arr.slice(0).reverse().findIndex(fn);
  if (index < 0) {
    return index;
  }

  return arr.length - index - 1;
};

const findMountSequence = ({ kernelDeviceMounts }) => {
  let mountJobs = [];

  kernelDeviceMounts.forEach((job) => {
    const indexOfLastParentMount = findLastIndex(mountJobs, (mountJob) => {
      return isPathContained({ "folder": mountJob.rootDir, "filename": job.rootDir });
    });

    const newMountJob = job;

    if (indexOfLastParentMount >= 0) {
      mountJobs = [
        ...mountJobs.slice(0, indexOfLastParentMount + 1),
        newMountJob,
        ...mountJobs.slice(indexOfLastParentMount + 1)
      ];
    } else {
      const indexOfFirstSubdir = mountJobs.findIndex((mountJob) => {
        return isPathContained({ "folder": job.rootDir, "filename": mountJob.rootDir });
      });

      if (indexOfFirstSubdir >= 0) {
        mountJobs = [
          ...mountJobs.slice(0, indexOfFirstSubdir),
          newMountJob,
          ...mountJobs.slice(indexOfFirstSubdir)
        ];
      } else {
        mountJobs = [
          ...mountJobs,
          newMountJob
        ];
      }
    }
  });

  return mountJobs;
};

const rbind = async ({ sourcePath, mountPath }) => {
  await shell.exec(`mount --rbind "${sourcePath}" "${mountPath}"`, { "verbose": true });

  const umount = async () => {
    await shell.exec(`umount -l ${mountPath}`, { "verbose": true });
  };

  return {
    mountPath,
    umount
  };
};

const mount = async ({ blockDevice, mountPath }) => {
  await shell.exec(`mount "${blockDevice}" "${mountPath}"`, { "verbose": true });

  const umount = async () => {
    await shell.exec(`umount ${mountPath}`, { "verbose": true });
  };

  return {
    mountPath,
    umount
  };
};

export default {
  findMountSequence,
  mount,
  rbind
};
