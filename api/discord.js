require("dotenv").config();

const express = require("express");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const router = express.Router();
const { URLSearchParams } = require("url");

const CLIENT_ID = process.env.OAUTH2_ID;
const CLIENT_TOKEN = process.env.OAUTH2_TOKEN;
const REDIRECT_URI = `${process.env.REDIRECT_DOMAIN}/api/discord/callback`;

console.log("redirect URI is: " + REDIRECT_URI);

router.get("/login", (req, res) => {
	res.redirect(
		`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&scope=identify&redirect_uri=${encodeURIComponent(
			REDIRECT_URI,
		)}`,
	);
});

router.post("/refresh", (req, res) => {
	// can be caused by a corrupted localStorage with no refresh token
	// thus sending empty json
	if (!req.body.refresh_token) {
		res.status(400).json({
			message: "No refresh token provided",
		});
		return;
	}

	const params = new URLSearchParams();
	params.append("client_id", CLIENT_ID);
	params.append("client_secret", CLIENT_TOKEN);
	params.append("grant_type", "refresh_token");
	params.append("refresh_token", req.body.refresh_token);

	fetch("https://discord.com/api/oauth2/token", {
		method: "POST",
		body: params,
	})
		.then((response) => {
			return response.json();
		})
		.then((json) => {
			res.send(json);
		})
		.catch((err) => {
			res.status(400);
			res.send(err);
		})
		.finally(() => {
			res.end();
		});
});

router.get("/callback", (req, res) => {
	if (!req.query.code) {
		res.status(400).send("No code given");
		return;
	}

	const params = new URLSearchParams();
	params.append("client_id", CLIENT_ID);
	params.append("client_secret", CLIENT_TOKEN);
	params.append("grant_type", "authorization_code");
	params.append("code", req.query.code);
	params.append("redirect_uri", REDIRECT_URI);
	params.append("scope", "identify");

	fetch("https://discord.com/api/oauth2/token", {
		method: "POST",
		body: params,
	})
		.then((response) => response.json())
		.then((json) => {
			res.redirect(
				`/?access_token=${encodeURIComponent(json.access_token)}&refresh_token=${encodeURIComponent(
					json.refresh_token,
				)}&expires_in=${encodeURIComponent(json.expires_in)}`,
			);
		})
		.catch((err) => {
			res.status(400);
			res.send(err);
		})
		.finally(() => {
			res.end();
		});
});

module.exports = router;
