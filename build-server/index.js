const { uploadBuildToS3 } = require("./utils/uploadBuildToS3");
const { createClient } = require("redis");
const simplegit = require("simple-git");
require("dotenv").config();
const path = require("path");

const { buildProject } = require("./utils/buildProject");
const { spinContainer } = require("./utils/ecsRunTaskCommand");
console.log(process.env.REDIS_URL);

const subscriber = createClient({
  url: `${process.env.REDIS_URL}`,
});

subscriber.on("error", (err) => {
  console.error("Redis Subscriber Error", err);
});

const publisher = createClient({
  url: `${process.env.REDIS_URL}`,
});

publisher.on("error", (err) => {
  console.error("Redis Subscriber Error", err);
});

async function publishLog(id, log) {
  await publisher.publish(`logs:${id}`, JSON.stringify({ log }));
}

async function buildService() {
  try {
    await subscriber.connect();
    await publisher.connect();
  } catch (err) {
    console.log("Couldn't connect to the redis client, Error: ", err);
    return;
  }

  while (1) {
    const length = await subscriber.lLen("buildqueue");
    console.log("length", length);
    const toBuild = await subscriber.lIndex("build-queue", 0);
    console.log("toBuild: ", toBuild);

    if (toBuild !== null) {
      const { id, gitURL, buildWith } = await JSON.parse(toBuild);

      if (buildWith == "container") {
        const envVars = { id, gitURL };
        await spinContainer(envVars);
      } else {
        try {
          await simplegit().clone(gitURL, path.join(__dirname, `output/${id}`));
          await buildProject(id, publisher);
          await uploadBuildToS3(id, publisher);
          try {
            publishLog(id, "deployed");
          } catch (err) {
            console.log("couldn't publish log, error: ", err);
          }

          try {
            await subscriber.rPop("build-queue");
          } catch (err) {
            console.log("couldn't pop from right, error: ", err);
          }
        } catch (err) {
          publishLog(id, "build failed");
          console.log("build error: ", err);
        }
      }
    }
  }
}

buildService();
