const { exec } = require("child_process");
const path = require("path");

async function buildProject(id, publisher) {
  async function publishLog(id, log) {
    await publisher.publish(`logs:${id}`, JSON.stringify({ log }));
  }

  return new Promise((resolve, reject) => {
    console.log("running scipt");
    publishLog(id, "Starting build");

    const parentDir = path.dirname(__dirname);
    const jailDir = path.join(parentDir, `output/${id}`);
    console.log("jailDir", jailDir);
    const child = exec("npm install && npm run build", {
      cwd: jailDir,
      stdio: "pipe",
      shell: false,
      env: { CHROOT: jailDir },
    });
    child.setMaxListeners(0);

    child.stdout.on("data", function (data) {
      publishLog(id, data.toString());
      console.log("stdout: " + data);
    });

    child.stderr.on("data", function (data) {
      publishLog(id, `error: ${data.toString()}`);
      console.error("stderr: " + data);
      reject(new Error("Build failed"));
    });

    child.on("close", function (code) {
      if (code !== 0) {
        publishLog(id, `Build process exited with code ${code}`);
        console.log(`Build process exited with code ${code}`);
        reject(new Error("Build failed"));
      } else {
        publishLog(id, `Build Complete`);
        console.log("Done...");
        resolve("Build successful");
      }
    });

    child.on("error", function (err) {
      publishLog(id, "Build process error: " + err);
      console.error("Build process error: " + err);
      reject(err);
    });
  });
}

module.exports = { buildProject };

// const spawn = require("child_process").spawn;
// const Redis = require("ioredis");
// const path = require("path");

// const publisher = new Redis();

// function publishLog(id, log) {
//   publisher.publish(`logs:${id}`, JSON.stringify({ log }));
// }

// async function buildProject(id) {
//   return new Promise((resolve, reject) => {
//     console.log("running scipt");
//     publishLog(id, "Starting build");
//     const jailDir = path.join(__dirname, `output/${id}/`);
//     const child = spawn("npm", ["install", "&&", "npm", "run", "build"], {
//       cwd: jailDir,
//       stdio: "pipe",
//       shell: false,
//       env: { CHROOT: jailDir },
//     });

//     child.stdout.on("data", function (data) {
//       publishLog(id, data.toString());
//       console.log("stdout: " + data);
//     });

//     child.stderr.on("data", function (data) {
//       publishLog(id, `error: ${data.toString()}`);
//       console.error("stderr: " + data);
//       reject(new Error("Build failed"));
//     });

//     child.on("close", function (code) {
//       if (code !== 0) {
//         publishLog(id, `Build process exited with code ${code}`);
//         console.log(`Build process exited with code ${code}`);
//         reject(new Error("Build failed"));
//       } else {
//         publishLog(id, `Build Complete`);
//         console.log("Done...");
//         resolve("Build successful");
//       }
//     });

//     child.on("error", function (err) {
//       publishLog(id, "Build process error: " + err);
//       console.error("Build process error: " + err);
//       reject(err);
//     });
//   });
// }

// module.exports = { buildProject };

// const { spawn } = require("child_process");
// const Redis = require("ioredis");
// const path = require("path");

// const publisher = new Redis(); // Provide Redis connection options if needed

// async function publishLog(id, log) {
//   try {
//     await publisher.publish(`logs:${id}`, JSON.stringify({ log }));
//   } catch (error) {
//     console.error("Error publishing log:", error);
//   }
// }

// async function buildProject(id) {
//   return new Promise((resolve, reject) => {
//     console.log("Running script");
//     publishLog(id, "Starting build");
//     const parentDir = path.dirname(__dirname);
//     const jailDir = path.join(parentDir, `output/${id}`);
//     console.log("Jail dir:", jailDir);

//     const child = spawn("npm", ["install", "&&", "run", "build"], {
//       cwd: jailDir,
//       stdio: "pipe",
//       shell: false, // Use shell for running multiple commands
//       env: { CHROOT: jailDir },
//     });

//     child.stdout.on("data", function (data) {
//       publishLog(id, data.toString());
//       console.log("stdout: " + data);
//     });

//     child.stderr.on("data", function (data) {
//       publishLog(id, `error: ${data.toString()}`);
//       console.error("stderr: " + data);
//       reject(new Error("Build failed"));
//     });

//     child.on("close", function (code) {
//       if (code !== 0) {
//         publishLog(id, `Build process exited with code ${code}`);
//         console.log(`Build process exited with code ${code}`);
//         reject(new Error("Build failed"));
//       } else {
//         publishLog(id, `Build Complete`);
//         console.log("Done...");
//         resolve("Build successful");
//       }
//     });

//     child.on("error", function (err) {
//       publishLog(id, "Build process error: " + err);
//       console.error("Build process error: " + err);
//       reject(err);
//     });
//   });
// }

// module.exports = { buildProject };

// const { spawn } = require("child_process");
// const Redis = require("ioredis");
// const path = require("path");

// const publisher = new Redis();

// function publishLog(id, log) {
//   publisher.publish(`logs:${id}`, JSON.stringify({ log }));
// }

// async function buildProject(id) {
//   return new Promise((resolve, reject) => {
//     console.log("running script");
//     publishLog(id, "Starting build");

//     const jailDir = path.join(__dirname, `output/${id}`);
//     console.log();

//     const child = spawn("npm", ["install"], {
//       cwd: jailDir,
//       stdio: "pipe",
//       shell: true, // Use shell to allow using npm directly
//       env: { CHROOT: jailDir },
//     });

//     child.on("exit", (code) => {
//       if (code === 0) {
//         const buildChild = spawn("npm", ["run", "build"], {
//           cwd: jailDir,
//           stdio: "pipe",
//           shell: false, // Use shell to allow using npm directly
//           env: { CHROOT: jailDir },
//         });

//         buildChild.stdout.on("data", function (data) {
//           publishLog(id, data.toString());
//           console.log("stdout: " + data);
//         });

//         buildChild.stderr.on("data", function (data) {
//           publishLog(id, `error: ${data.toString()}`);
//           console.error("stderr: " + data);
//           reject(new Error("Build failed"));
//         });

//         buildChild.on("close", function (code) {
//           if (code !== 0) {
//             publishLog(id, `Build process exited with code ${code}`);
//             console.log(`Build process exited with code ${code}`);
//             reject(new Error("Build failed"));
//           } else {
//             publishLog(id, `Build Complete`);
//             console.log("Done...");
//             resolve("Build successful");
//           }
//         });

//         buildChild.on("error", function (err) {
//           publishLog(id, "Build process error: " + err);
//           console.error("Build process error: " + err);
//           reject(err);
//         });
//       } else {
//         publishLog(id, `npm install failed with code ${code}`);
//         console.error(`npm install failed with code ${code}`);
//         reject(new Error("npm install failed"));
//       }
//     });

//     child.on("error", function (err) {
//       publishLog(id, "npm install process error: " + err);
//       console.error("npm install process error: " + err);
//       reject(err);
//     });
//   });
// }

// module.exports = { buildProject };
