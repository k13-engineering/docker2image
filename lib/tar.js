import untar from "untar-to-memory";
import tarFs from "tar-fs";
import fs from "fs";

const readEntry = ({ tarFile, pathInTar }) => {
  return new Promise((resolve, reject) => {
    untar.readEntry(tarFile, pathInTar, null, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
};

const extractTarFileTo = async ({ tarFile, rootDir }) => {
  await new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(tarFile);
    readStream.on("error", (err) => {
      reject(err);
    });

    const extract = tarFs.extract(rootDir, { "umask": 0 });
    extract.on("error", (err) => {
      reject(err);
    });

    extract.on("finish", () => {
      resolve();
    });

    readStream.pipe(extract);
  });
};

export default {
  readEntry,
  extractTarFileTo
};
