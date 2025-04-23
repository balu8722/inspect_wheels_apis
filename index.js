const express = require("express");
const http = require("http");
const cors = require("cors");
const cron = require("node-cron");
const moment = require("moment");

const { ENV_DATA } = require("./config/config");
const { ROUTES } = require("./routers/routes.index");
const {
  deleteOldLogContent,
} = require("./middlewares/logger/deletelogfiles");
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);

// Schedule a cron job to run at midnight (0 0 * * *)
cron.schedule(
  "0 0 * * *",
  () => {
    deleteOldLogContent();
  },
  {
    timezone: "Asia/Kolkata",
  }
);

// api routes
app.use("/admin", ROUTES.AUTH_ROUTE);
app.use("/client", ROUTES.CLIENT_ROUTE);
app.use("/so", ROUTES.SO_ROUTE);

// app.use("/ro", ROUTES.HOSPITAL_ROUTE);

// running the port   "10.20.121.6",
server.listen(ENV_DATA.BACKEND_PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log("server port running====>", ENV_DATA.BACKEND_PORT);
});
