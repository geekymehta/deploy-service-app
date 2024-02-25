const Redis = require("ioredis");

const publisher = new Redis();
const subscriber = new Redis();

function publishLog(id, log) {
  publisher.publish(`logs:${id}`, JSON.stringify({ log }));
}

module.exports = { publishLog };
