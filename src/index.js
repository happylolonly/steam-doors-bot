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

  const formattedCookies = cookies
    .filter(item => item.host.includes("steam"))
    .map(({ name, value }) => {
      return {
        name,
        value
      };
    });

  await page.goto("https://steamcommunity.com/login/home");

  await page.setCookie(...formattedCookies);

  await page.type("#loginForm #steamAccountName", login);
  await page.type("#loginForm #steamPassword", password);
  await page.click("#loginForm #SteamLogin");

  await page.waitFor(12000);

  const isClose = await page.evaluate(async () => {
    const modal = document.querySelector(".loginTwoFactorCodeModal");

    if (modal && modal.style.display === "") {
      return Promise.resolve(true);
    }
    return false;
  });

  if (isClose) {
    await browser.close();
    return;
  }

  await page.goto("https://store.steampowered.com/");
  await page.click(".cottage_link");
  await page.waitFor(4000);

  await page.evaluate(async () => {
    const doors = Array.from(
      document.querySelectorAll(".cottage_doorset:not(.cottage_door_open)")
    );

    for (const door of doors.entries()) {
      door.click();
    }
  });

  await page.waitFor(7000);

  await browser.close();
}
