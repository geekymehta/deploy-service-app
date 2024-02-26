const { S3Client } = require("@aws-sdk/client-s3");
require("dotenv").config();
// const { ECSClient } = require("@aws-sdk/client-ecs");

const s3Client = new S3Client({
  region: `${process.env.AWS_REGION}`,
  credentials: {
    accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
  },
});

// const ecsClient = new ECSClient({
//   region: `${process.env.AWS_REGION}`,
//   credentials: {
//     accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
//     secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
//   },
// });

// const config = {
//   CLUSTER: `${process.env.AWS_ECS_CLUSTER}`,
//   TASK: `${process.env.AWS_ECS_TASK}`,
// };

// console.log(process.env.)

module.exports = { s3Client };
