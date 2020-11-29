/* global describe */
/* global it */

import config from "../lib/config.js";

import path from "path";
import assert from "assert";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("config", () => {
  it("should read configs correctly", async() => {
    const parsedConfig = await config.readFromTar({
      "tarFile": path.resolve(__dirname, "assets/image.tar")
    });

    const expectedConfig = {
      "partition_type": "msdos",
      "partitions": [
        {
          "start": 1048576,
          "end": 105906175,
          "path": "/boot",
          "fsType": "fat32"
        },
        {
          "start": 105906176,
          "end": "100%",
          "path": "/",
          "fsType": "ext4"
        }
      ]
    };

    assert.deepEqual(parsedConfig, expectedConfig, "config should be as expected");
  });
});
