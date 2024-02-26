const { PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const fs = require("fs");
const path = require("path");
const { s3Client } = require("../config/awsConfig");

const { createClient } = require("redis");

async function uploadBuildToS3(id, publisher) {
  async function publishLog(id, log) {
    await publisher.publish(`logs:${id}`, JSON.stringify({ log }));
  }

  const parentDir = path.dirname(__dirname);
  const distFolderPath = path.join(parentDir, "output", `${id}`, "dist");
  console.log(distFolderPath);
  const distFolderContents = fs.readdirSync(distFolderPath, {
    recursive: true,
  });

  await publishLog(id, `Starting to upload`);
  for (const file of distFolderContents) {
    const filePath = path.join(distFolderPath, file);
    if (fs.lstatSync(filePath).isDirectory()) continue;

    console.log("uploading", filePath);
    await publishLog(id, `uploading ${file}`);

    const key = `__outputs/${id}/${file}`.replace(/\\/g, "/");
    const command = new PutObjectCommand({
      Bucket: "deploy-service-apps",
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentType: mime.lookup(filePath),
    });

    await s3Client.send(command);
    publishLog(id, `uploaded ${file}`);
    console.log("uploaded", filePath);
  }
  await publishLog(id, `Done`);
}

module.exports = { uploadBuildToS3 };
