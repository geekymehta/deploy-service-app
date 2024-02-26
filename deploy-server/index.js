const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { createClient } = require("redis");
const { generateSlug } = require("random-word-slugs");

const PORT = process.env.PORT || 9000;

const app = express();
app.use(cors());
app.use(express.json());

const publisher = createClient({
  url: `${process.env.REDIS_URL}`,
});

publisher.on("error", (err) => {
  console.error("Redis Publisher Error", err);
});

app.post("/deploy-without-container", async (req, res) => {
  const { gitURL, slug } = req.body;
  const projectSlug = slug ? slug : generateSlug();
  console.log("projectSlug: ", projectSlug);

  const objectToPush = {
    id: projectSlug,
    gitURL,
    buildWith: "server",
  };
  const serializedObject = JSON.stringify(objectToPush);

  try {
    await publisher.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }

  await publisher.lPush("build-queue", serializedObject);
  console.log(await publisher.lIndex("build-queue", 0));

  try {
    await publisher.quit();
  } catch (error) {
    console.log("could not quit redis publisher, error: ", error);
  }

  return res.json({
    status: "queued",
    data: { projectSlug, url: `http://${projectSlug}.localhost:8000` },
  });
});

app.post("/deploy-with-container", async (req, res) => {
  const { gitURL, slug } = req.body;
  const projectSlug = slug ? slug : generateSlug();
  console.log("projectSlug: ", projectSlug);

  const objectToPush = {
    id: projectSlug,
    gitURL,
    buildWith: "container",
  };
  const serializedObject = JSON.stringify(objectToPush);

  try {
    await publisher.connect();
    console.log("Connected to Redis");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }

  await publisher.lPush("build-queue", serializedObject);
  console.log(await publisher.lIndex("build-queue", 0));

  try {
    await publisher.quit();
  } catch (error) {
    console.log("could not quit redis publisher, error: ", error);
  }

  return res.json({
    status: "queued",
    data: { projectSlug, url: `http://${projectSlug}.localhost:8000` },
  });
});

app.listen(PORT, () => console.log(`API Server Running..${PORT}`));
// app.get("/status", async (req, res) => {
//   try {
//     await subscriber.quit();
//   } catch (error) {
//     console.log("could not quit redis publisher, error: ", error);
//   }
//   const id = req.query.id;
//   // const response = await subscriber.hGet("status", id);
//   const response = "deployed";
//   res.json({
//     status: response,
//   });
// });

//for socket connections
// const { createClient } = require("redis");

// // Create a Redis subscriber client
// const subscriber = createClient();

// // Subscribe to the "logs" channel
// subscriber.subscribe("logs");

// // Listen for messages on the subscribed channels
// subscriber.on("message", (channel, message) => {
//   console.log(`[${channel}] ${message}`);
// });

// console.log("Listening for logs...");

// // Note: Make sure your Redis server is running and accessible.

// // Handle errors
// subscriber.on("error", (error) => {
//   console.error("Redis subscriber error:", error);
// });
