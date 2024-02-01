import "dotenv/config";

import express from "express";
import { readFileSync } from "fs";
import { readdir } from "fs/promises";
import { join } from "path";
import discord from "./api/discord.js";

const port = process.env.PORT;
const VERBOSE = process.env.VERBOSE === "true";
const DEV = process.env.DEV === "true";
const API_URL = process.env.API_URL || "https://api.faithfulpack.net/v2";
const app = express();
app.disable("x-powered-by");
const webappURL = "/";

process.on("unhandledRejection", (reason, promise) => {
  console.error(reason);
  console.trace(promise);
});

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  }),
);

app.use(express.json({ limit: "50mb" }));

// serve base url through express, the rest is mostly web js
app.get(webappURL, async (req, res) => {
  let file = readFileSync("./index.html", "utf8");

  const WINDOW_ENV = {
    DISCORD_USER_URL: process.env["DISCORD_USER_URL"] || undefined,
  };

  file = file.replace(
    "</head>",
    `  <script>\n` +
      `    window.apiURL = '${API_URL}'\n` +
      `    window.env = ${JSON.stringify(WINDOW_ENV)}\n` +
      `    window.DEV = ${DEV}\n` +
      `  </script>\n</head>`,
  );

  // change Vue to dev version for devtools
  if (DEV) {
    file = file.replace("/vue.min.js", "/vue.js");
    file = file.replace("vuetify.min.js", "vuetify.js");
    file = file.replace("/pinia.iife.min.js", "/pinia.iife.js");
  }

  if (DEV && process.env.BROWSER_REFRESH_URL) {
    file = file.replace(
      "</body>",
      `<script src="${process.env.BROWSER_REFRESH_URL}"></script></body>`,
    );
  }

  const langs = await getLanguages().catch(errorHandler(res));

  file = file.replace(
    "</body>",
    "<script>const LANGUAGES = " + JSON.stringify(langs) + "</script></body>",
  );

  res.send(file);
});

app.listen(port, () => {
  console.log(`API at ${API_URL}`);
  console.log(`Web App at http://localhost:${port}${webappURL}`);

  if (DEV && process.send) {
    process.send("online");
  }
});

// https://www.techonthenet.com/js/language_tags.php
const langPath = ["resources", "strings"];
const languagesPath = join(process.cwd(), ...langPath);
const getLanguages = () =>
  readdir(languagesPath).then((files) =>
    files
      .filter((f) => f.endsWith("js"))
      .map((e) => {
        const name = e.split(".").slice(0, -1).join(".");
        return {
          lang: name.includes("en") ? "en" : name.slice(-2).toLowerCase(),
          bcp47: name.replace("_", "-"),
          file: ["", ...langPath, e].join("/"),
        };
      }),
  );

app.use(
  express.static(".", {
    extensions: ["html", "xml", "json"],
  }),
);

app.use("/api/discord", discord);

/**
 * Error handling generic for all requests
 * @param {express.Response<any, Record<string, any>, number>} res
 */
const errorHandler = (res) => (err) => {
  // advance parsing for axios errors and custom codes errors
  const code = (err.response ? err.response.status : err.code) || 400;
  const message =
    (err.response && err.response.data ? err.response.data.error : err.message) || err;

  if (VERBOSE) {
    console.error(code, message);
    console.error(err.stack);
  }
  res.status(code);
  res.send({ error: `${message}` });
  res.end();
};
