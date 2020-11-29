import tarFs from "tar-fs";

const copyPreservingAttributes = async ({
  sourceDirectory,
  targetDirectory
}) => {
  await new Promise((resolve, reject) => {
    const sourceStream = tarFs.pack(sourceDirectory, {
      "umask": 0
    });
    sourceStream.on("error", (err) => {
      reject(err);
    });

    const targetStream = tarFs.extract(targetDirectory, {
      "umask": 0
    });
    targetStream.on("error", (err) => {
      reject(err);
    });
    targetStream.on("finish", () => {
      resolve();
    });

    sourceStream.pipe(targetStream);
  });
};

export default {
  copyPreservingAttributes
};
