const puppeteer = require("puppeteer");
const { expect } = require("chai");
const createServerPromise = require("./mock_server");

require("dotenv").config({
  path: __dirname + "/.env.test",
});

// puppeteer options
/** @type {import('puppeteer').PuppeteerLaunchOptions} */
const opts = {
  // headless: false,
  timeout: 10000,
};

describe("Auth test", async () => {
  /** @type {import('puppeteer').Browser} */
  let browser;
  /** @type {import('puppeteer').Page} */
  let page;
  /** @type {import('http').Server} */
  let server;

  const WEBAPP_ROOT_URL = process.env.REDIRECT_DOMAIN;

  const USERNAME = "Herobrine";

  async function closeAll() {
    await page.close();
    await browser.close();
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  before(async () => {
    server = await createServerPromise(USERNAME);

    browser = await puppeteer.launch(opts);
    const pages = await browser.pages();
    if (pages.length) page = pages[0];
    else page = await browser.newPage();
    await page.goto(WEBAPP_ROOT_URL);
  });

  const ACCESS_TOKEN = "1234567890";
  const REFRESH_TOKEN = "0987654321";
  const EXPIRES_IN = "604800"; // s = 7 days

  it("should create an account for " + USERNAME, async () => {
    // directly go to web app
    await page.goto(
      WEBAPP_ROOT_URL +
        "/" +
        `?access_token=${ACCESS_TOKEN}` +
        `&refresh_token=${REFRESH_TOKEN}` +
        `&expires_in=${EXPIRES_IN}`,
    );

    let element = await page.waitForSelector(".dashboard-card #user-username", { timeout: 5000 });
    const text = await element.evaluate((el) => el.textContent);
    expect(text.trim()).to.equal(USERNAME);
  });

  after(async () => {
    await closeAll();
  });
});
