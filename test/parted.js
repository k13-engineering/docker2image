/* global describe */
/* global it */

import parted from "../lib/parted.js";
import fs from "fs";
import assert from "assert";

const testPartedScript = `
mklabel msdos
mkpart primary fat32 2048s 100%
`;

describe("parted", () => {
  it("should create partitions correctly", async() => {
    const fh = await fs.promises.open("test.img", "w");
    await fh.truncate(10 * 1024 * 1024);
    await fh.close();

    const { partitions } = await parted.run({
      "device": "test.img",
      "script": testPartedScript
    });

    assert(Array.isArray(partitions));
    assert.equal(partitions.length, 1);
    assert.equal(partitions[0].start, 1048576);
    assert.equal(partitions[0].end, 10485759);
  });
});
