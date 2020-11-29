/* global describe */
/* global it */

import mountLib from "../lib/mount.js";

import assert from "assert";

describe("mount", () => {
  describe("order", () => {
    it.only("should order mounts correctly", () => {
      const kernelDeviceMounts = [
        {
          "rootDir": "/boot",
          "devicePath": "/dev/loop0p1"
        },
        {
          "rootDir": "/",
          "devicePath": "/dev/loop0p2"
        },
        {
          "rootDir": "/home/simon",
          "devicePath": "/dev/loop0p3"
        }
      ];

      const { mountJobs } = mountLib.findMountSequence({ kernelDeviceMounts });

      assert.deepEqual(mountJobs[0], kernelDeviceMounts[1]);
      assert.equal(mountJobs.length, kernelDeviceMounts.length);
    });
  });
});
