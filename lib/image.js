import parted from "./parted.js";
import dockerfiler from "node-dockerfiler";
import fs from "fs";

import path from "path";
import {
  fileURLToPath
} from "url";

const __dirname = path.dirname(fileURLToPath(
  import.meta.url));

const generatePartedScript = ({
  layout
}) => {
  if (!layout.partition_type) {
    throw new Error("partition_type field is missing");
  }

  let script = `mklabel ${layout.partition_type}\n`;

  layout.partitions.map((part, idx) => {
    if (part.start === undefined) {
      throw new Error(`partition ${idx} has no start property`);
    }

    if (part.end === undefined) {
      throw new Error(`partition ${idx} has no end property`);
    }

    if (part.fsType === undefined) {
      throw new Error(`partition ${idx} has no fsType property`);
    }

    const start = typeof part.start === "number" ? `${part.start}b` : part.start;
    const end = typeof part.end === "number" ? `${part.end}b` : part.end;

    script += `
      mkpart primary ${part.fsType} ${start} ${end}
      ${(part.flags || []).map((flag) => `set ${idx + 1} ${flag} on`).join("\n")}
    `;
  });

  return script;
};

const setupPartitions = async ({
  targetImage,
  parsedConfig
}) => {
  const script = generatePartedScript({
    "layout": parsedConfig
  });

  const {
    partitions
  } = await parted.run({
    "device": targetImage,
    script
  });

  return {
    partitions
  };
};

const createImage = async ({
  targetImage,
  parsedConfig,
  tarFile
}) => {
  const {
    partitions
  } = await setupPartitions({
    targetImage,
    parsedConfig
  });

  const mappedPartitions = parsedConfig.partitions.map((part, idx) => {
    return {
      "fsType": part.fsType,
      "rootDir": part.path,
      "start": partitions[idx].start,
      "end": partitions[idx].end,
      "fstab": part.fstab
    };
  });

  const jobs = Object.assign({}, parsedConfig, {
    "partitions": mappedPartitions,
  });

  const jobsFile = "jobs.json";
  await fs.promises.writeFile(jobsFile, JSON.stringify(jobs));

  const dockerfileContent = `
    FROM node:15-buster

    RUN apt-get update -q -y && apt-get install -y dosfstools

    RUN mkdir /docker2image
    COPY . /docker2image
    WORKDIR /docker2image
    RUN npm install

    CMD node /docker2image/inside-docker.js
  `;

  const result = await dockerfiler.run({
    dockerfileContent,
    "context": path.resolve(__dirname, ".."),
    "ignore": (name) => {
      return ["node_modules"].indexOf(name) >= 0;
    },
    "options": {
      "Privileged": true,
      "Binds": [
        "/dev:/dev",
        `${path.resolve(jobsFile)}:/interface/jobs.json`,
        `${path.resolve(targetImage)}:/interface/target`,
        `${path.resolve(tarFile)}:/interface/image.tar`
      ]
    }
  });

  if (result.StatusCode !== 0) {
    console.log("exitCode =", result.StatusCode);
    throw new Error("docker helper failed");
  }
};

export default {
  createImage
};
