const { createClient } = require("redis");
require("dotenv").config();

const publisher = createClient({
  url: `${process.env.REDIS_URL}`,
});

const subscriber = createClient({
  url: `${process.env.REDIS_URL}`,
});

publisher.on("error", (err) => {
  console.error("Redis Publisher Error", err);
});

subscriber.on("error", (err) => {
  console.error("Redis Subscriber Error", err);
});

(async () => {
  try {
    await publisher.connect();
    await subscriber.connect();

    console.log("Connected to Redis");

    // Now let's push items to the queue
    // await publisher.del("build-queue");

    // publisher.lPush("build-queue", "p1");

    console.log(await publisher.lIndex("build-queue", 0));
    console.log(await subscriber.rPop("build-queue"));

    // await publisher.lIndex("build-queue", 0, (err, reply) => {
    //   if (err) {
    //     console.error("Error:", err);
    //   } else {
    //     // Parse the JSON string back into an object
    //     const parsedObject = JSON.parse(reply);
    //     console.log("Retrieved object from Redis list:", parsedObject);
    //   }
    // });
    // console.log(await publisher.rPop("build-queue")); // Retrieve and log the last item from the queue
    // console.log(await subscriber.rPop("build-queue")); // Retrieve and log the last item from the queue

    // Don't forget to quit the connection after you're done
    publisher.quit();
    subscriber.quit();
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
})();
