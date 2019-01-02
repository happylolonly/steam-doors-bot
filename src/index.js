const puppeteer = require("puppeteer");

const credentials = require("../credentials");
const cookies = require("../cookies");

(async () => {
  for (credential of credentials) {
    await run(credential);
  }
})();

async function run(params) {
  const { login, password } = params;

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const formattedCookies = cookies.map(({ name, value }) => {
    return {
      name,
      value
    };
  });

  await page.goto("https://steamcommunity.com/login/home");

  await page.setCookie(...formattedCookies);

  await page.type("#loginForm #steamAccountName", login);
  await page.type("#loginForm #steamPassword", password);
  await page.click('#loginForm #SteamLogin');
  await page.waitForNavigation();

  await page.goto("https://store.steampowered.com/");
  await page.click('.cottage_link');
  await page.waitForNavigation();

  await page.evaluate(async () => {
    const doors = Array.from(document.querySelectorAll(".cottage_doorset"));

    for (const door of doors.entries()) {
      door.click();

      // if (doors.indexOf(door) > 1) {
      //   break;
      // }
    }
  });

  // await browser.close();
}
