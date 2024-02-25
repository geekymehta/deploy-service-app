const express = require("express");
require("dotenv").config();
const { generateSlug } = require("random-word-slugs");
const simplegit = require("simple-git");
const path = require("path");
const { buildProject } = require("./utils/buildProject");
const { uploadBuildToS3 } = require("./utils/uploadBuildToS3");

console.log(process.env.AWS_REGION);

const app = express();
const PORT = 9000;

app.use(express.json());

app.post("/deploy-without-container", async (req, res) => {
  const { gitURL, slug } = req.body;
  const projectSlug = slug ? slug : generateSlug();

  await simplegit().clone(
    gitURL,
    path.join(__dirname, `output/${projectSlug}`)
  );
  await buildProject(projectSlug);
  await uploadBuildToS3(projectSlug);

  return res.json({
    status: "queued",
    data: { projectSlug, url: `http://${projectSlug}.localhost:8000` },
  });
});

app.post("/deploy-with-container", async (req, res) => {
  const { gitURL, slug } = req.body;
  const projectSlug = slug ? slug : generateSlug();
  const envVars = {
    gitURL,
    projectSlug,
  };

  // Spin the container
  await spinContainer(envVars);

  return res.json({
    status: "queued",
    data: { projectSlug, url: `http://${projectSlug}.localhost:8000` },
  });
});

app.listen(PORT, () => console.log(`API Server Running..${PORT}`));
