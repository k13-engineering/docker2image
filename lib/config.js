import tar from "./tar.js";

const readFromTar = async ({ tarFile }) => {
  const buffer = await tar.readEntry({ tarFile, "pathInTar": "mkbootdrive.conf" });
  const configAsString = buffer.toString("utf8");
  const configParsed = JSON.parse(configAsString);
  return configParsed;
};

export default {
  readFromTar
};
