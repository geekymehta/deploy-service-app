const { RunTaskCommand } = require("@aws-sdk/client-ecs");
const { ecsClient, config } = require("../config/awsConfig");

const spinContainer = async (envVars) => {
  const command = new RunTaskCommand({
    cluster: config.CLUSTER,
    taskDefinition: config.TASK,
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: [
          "subnet-064bbb06ef5ccb5cd",
          "subnet-09f233fd0699f5297",
          "subnet-0716cb0e4caf5eb0e",
        ],
        securityGroups: ["sg-097978ad1510e6149"],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "builder-image",
          environment: [
            { name: "GIT_REPOSITORY__URL", value: envVars.gitURL },
            { name: "PROJECT_ID", value: envVars.projectSlug },
          ],
        },
      ],
    },
  });
  await ecsClient.send(command);
};

module.exports = { spinContainer };
