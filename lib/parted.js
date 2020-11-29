import shell from "./shell.js";
import assert from "assert";

const run = async ({ device, script }) => {
  const scriptFormatted = script.split("\n").map((line) => line.trim()).join("  ");
  const { stdout } = await shell.exec(`parted ${device} --script ${scriptFormatted} unit b  print`, {
    "verbose": true
  });

  const lines = stdout.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
  const firstEntryIndex = lines.findIndex((line) => line.startsWith("1"));
  const entries = lines.slice(firstEntryIndex);

  const partitions = entries.map((entry) => {
    const parts = entry.split(/\s+/g);

    const startStr = parts[1];
    const endStr = parts[2];

    const parseBytes = (str) => {
      const match = str.match(/([0-9]+)B/);
      assert(match, "output of parted should be parsable");

      const parsed = parseInt(match[1], 10);
      assert(!isNaN(parsed), "output of parted should be a number");

      return parsed;
    };

    const start = parseBytes(startStr);
    const end = parseBytes(endStr);

    return {
      start,
      end
    };
  });

  return {
    partitions
  };
};

export default {
  run
};
