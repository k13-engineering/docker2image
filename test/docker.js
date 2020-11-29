/* global describe */
/* global it */

import docker from "../lib/docker.js";
import path from "path";

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe("docker build", () => {
  it("should build correctly", async() => {
    await docker.build({
      "Dockerfile": path.resolve(__dirname, "./docker-build-test/Dockerfile"),
      "context": path.resolve(__dirname, "./docker-build-test"),
      "outputTarFile": "test.tar"
    });
  });
});
