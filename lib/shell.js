import child_process from "child_process";

const exec = (command, { verbose = false, cwd } = {}) => {
  if (verbose) {
    console.log(`--> ${command}`);
  }

  return new Promise((resolve, reject) => {
    const proc = child_process.spawn(command, {
      "shell": true,
      cwd,
      "pipe": ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);

    proc.stdout.on("data", (data) => {
      stdout += data;
    });
    proc.stderr.on("data", (data) => {
      stderr += data;
    });

    proc.on("error", (err) => {
      reject(err);
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve({
          stdout,
          stderr
        });
      } else {
        reject({
          "err": new Error(`process exited with error code ${code}`),
          stdout,
          stderr
        });
      }
    });
  });
};

export default {
  exec
};
