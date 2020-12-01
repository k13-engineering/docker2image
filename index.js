import fs from "fs";
import path from "path";

import tmp from "tmp-promise";

import docker from "./lib/docker.js";
import config from "./lib/config.js";
import image from "./lib/image.js";

const buildImageFromTar = async ({
  targetImage,
  tarFile,
  tmpdir
}) => {
  const parsedConfig = await config.readFromTar({
    tarFile
  });

  await image.createImage({
    targetImage,
    parsedConfig,
    tarFile,
    tmpdir
  });
};

const docker2image = async ({
  targetImage,
  Dockerfile,
  context,
  tmpdir
}) => {
  await tmp.withDir(async (dir) => {
    const outputTarFile = path.resolve(dir.path, "out.tar");

    await docker.build({
      targetImage,
      Dockerfile,
      context,
      outputTarFile
    });

    try {
      await buildImageFromTar({
        targetImage,
        "tarFile": outputTarFile,
        "tmpdir": dir.path
      });
    } finally {
      await fs.promises.unlink(outputTarFile);
    }
  }, {
    tmpdir
  });
};

export default docker2image;
