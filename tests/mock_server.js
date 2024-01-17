var express = require("express");
var cors = require("cors");

require("dotenv").config({
  path: __dirname + "/.env.test",
});

function createServer(port = undefined, username = undefined, callback = undefined) {
  if (port == undefined) port = process.env.API_PORT;

  const global = express();
  /** @type {import('http').Server} */
  let server;
  server = global.listen(port, () => {
    console.log("Mock API server running on port " + port);

    if (callback && typeof callback === "function") {
      callback(server);
    }
  });

  const app = express.Router();
  global.use(cors());
  global.use("/v2", app);

  app.post("/users/newprofile", (req, res) => {
    const discord_id = req.headers["Discord"];
    return res.json({
      username: "",
      uuid: "",
      anonymous: false,
      roles: [],
      warns: [],
      id: String(discord_id),
      media: [],
    });
  });

  global.get("/fake-discord-profile", (_req, res) => {
    return res.json({
      id: "123456789",
      avatar: null,
      banner: null,
      username: username,
      discriminator: 0,
    });
  });
}

/**
 *
 * @param {Number?} port Server port
 * @returns {Promise<import('http').Server>}
 */
function createServerPromise(username) {
  return new Promise((resolve, reject) => {
    try {
      createServer(undefined, username, (server) => {
        resolve(server);
      });
    } catch (error) {
      reject(error);
    }
  });
}

if (require.main === module) {
  createServer();
} else {
  module.exports = createServerPromise;
}
