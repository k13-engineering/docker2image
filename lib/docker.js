import shell from "./shell.js";

const build = async ({ Dockerfile, context, outputTarFile }) => {
  await shell.exec(`docker build -t docker2image/tmp ${context} -f ${Dockerfile}`, {
    "verbose": true
  });

  const { stdout } = await shell.exec(`docker create docker2image/tmp /bin/bash`, {
    "verbose": true
  });
  const containerId = stdout.trim();

  await shell.exec(`docker export -o ${outputTarFile} ${containerId}`, {
    "verbose": true
  });
};

export default {
  build
};
