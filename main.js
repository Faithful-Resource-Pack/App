/* global __dirname */

require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const port = process.env.PORT;
const VERBOSE = (process.env.VERBOSE || "false") === "true";
const DEV = (process.env.DEV || "false") === "true";
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

app.get(webappURL, async (req, res) => {
	let file = fs.readFileSync("./index.html", "utf8");

	const WINDOW_ENV = {
		DISCORD_USER_URL: process.env["DISCORD_USER_URL"] || undefined,
	};

	file = file.replace(
		"</head>",
		`  <script>\n` +
			`    window.apiURL = '${API_URL}'\n` +
			`    window.env = ${JSON.stringify(WINDOW_ENV)}\n` +
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

	let langs = await getLanguages().catch(errorHandler(res));

	file = file.replace(
		"</body>",
		"<script>const LANGUAGES = " + JSON.stringify(langs) + "</script></body>",
	);

	res.send(file);
});

app.listen(port, () => {
	console.log(`API url at ${API_URL}`);
	console.log(`Listening at http://localhost:${port}`);
	console.log(`Web App at http://localhost:${port}${webappURL}`);

	if (DEV && process.send) {
		process.send("online");
	}
});

// https://www.techonthenet.com/js/language_tags.php
const langPath = ["resources", "strings"];
const languagesPath = path.join(__dirname, ...langPath);
const getLanguages = function () {
	return fs.promises.readdir(languagesPath).then((files) => {
		const result = files
			.filter((f) => f.endsWith("js"))
			.map((e) => {
				const name = e.split(".").slice(0, -1).join(".");
				return {
					lang: name.includes("en") ? "en" : name.slice(-2).toLowerCase(),
					bcp47: name.replace("_", "-"),
					file: ["", ...langPath, e].join("/"),
				};
			});

		return result;
	});
};

app.use(
	express.static(".", {
		extensions: ["html", "xml", "json"],
	}),
);
app.use("/api/discord", require("./api/discord"));

/**
 * Error handling generic for all request
 * @param {Response<any, Record<string, any>, number>} res
 * @return {Function}
 */
const errorHandler = function (res) {
	return (err) => {
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
};
