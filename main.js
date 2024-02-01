import "dotenv/config";

import express from "express";
import discord from "./api/discord.js";

const port = process.env.PORT;
const DEV = process.env.DEV === "true";
const app = express();
app.disable("x-powered-by");

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

app.listen(port, () => {
  console.log(`Web App at http://localhost:${port}`);

  if (DEV && process.send) {
    process.send("online");
  }
});

app.use(
  express.static(".", {
    extensions: ["html", "xml", "json"],
  }),
);

app.use("/api/discord", discord);
