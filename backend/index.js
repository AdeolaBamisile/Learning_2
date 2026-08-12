process.env.NODE_ENV == "production" &&
  require("node:dns/promises").setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();

const startServer = require("./server");
const connectToDatabase = require("./db");

const main = async () => {
  await connectToDatabase(process.env.MONGODB_URL);
  startServer(process.env.PORT);
};

main();
