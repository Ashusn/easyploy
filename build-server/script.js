const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");
const Redis = require("ioredis");

const publisher = new Redis(
  "" //redis service
);

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
});

const PROJECT_ID = process.env.PROJECT_ID;
function publishLog(log) {
  publisher.publish(`logs:${PROJECT_ID}`,JSON.stringify({log}));
}

async function init() {
  console.log("Executing script.js");
  publishLog('Build Started...');
  const outDirPath = path.join(__dirname, "output");

  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  p.stdout.on("data", function (data) {
    console.log(data.toString());
    publishLog(data.toString());
  });

  p.stdout.on("error", function (data) {
    console.log("Error", data.toString());
    publishLog(`error: ${data.toString()}`);
  });

  p.on("close", async function () {
    console.log("Build Complete");
    publishLog(`Build Complete...`);
    const distFolderPath = path.join(__dirname, "output", "dist");
    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    publishLog(`Starting To Upload`);
    //now we will iterate over the folder file by file
    for (const file of distFolderContents) {
      const filePath = path.join(distFolderPath, file);
      //to check if the file path is a folder or not
      if (fs.lstatSync(filePath).isDirectory()) continue;

      console.log("Uploading", filePath);
      publishLog(`Uploading ${file}`);

      //else upload to S3

      const command = new PutObjectCommand({
        Bucket: "",
        Key: `__outputs/${PROJECT_ID}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath), // dynamically decide the content type
      });

      await s3Client.send(command);
      publishLog(`Uploaded ${file}`);
      console.log("Uploaded", filePath);
    }
    publishLog(`Done`);
    console.log("Done");
  });
}

init();
