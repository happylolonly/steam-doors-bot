const puppeteer = require("puppeteer");
const data = require("../data");
const fs = require("fs");
const { promisify } = require("util");

const writeFile = promisify(fs.writeFile);

function delay(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

(async () => {
  for (item of data) {
    const { login, password } = item;

    await check(item);
  }
})();

async function check(params) {
  const { login, password } = params;

  const browser = await puppeteer.launch({ headless: false });
  await browser.userAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
  );
  const page = await browser.newPage();

  await page.goto("https://steamcommunity.com/login/home");

  const c = require("../dat");
  let c2 = !!c.find(item => item.name.includes("steamMachineAuth"));

  if (c2) {
    await page.setCookie(...c);
  }
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
  );

  await page.type("#loginForm #steamAccountName", login);
  await page.type("#loginForm #steamPassword", password);

  await page.evaluate(async () => {
    document.querySelector("#loginForm #SteamLogin").click();
  });

  await delay(4500);

  if (!c2) {
    let isModal = false;
    let code = "";

    [code, isModal] = await page.evaluate(async () => {
      const modal = document.querySelector(".loginAuthCodeModal");

      if (modal && modal.style.display === "") {
        isModal = true;
        code = prompt("Enter code:");

        return Promise.resolve([code, isModal]);
      }
    });

    if (isModal) {
      console.log("here", code);
      await page.type("#authcode", code);

      await page.evaluate(async () => {
        const modal = document.querySelector(
          ".loginAuthCodeModal .auth_button.leftbtn"
        );
        modal.click();
      });

      await delay(2500);

      const cookies = await page.cookies();

      await writeFile("./dat.json", JSON.stringify(cookies));
      console.log(cookies);
      await browser.close();
      return;
    }
  }

  await delay(2500);
  await page.goto("https://store.steampowered.com/");

  await page.evaluate(async () => {
    document.querySelector(".cottage_link").click();
  });

  await delay(4500);

  await page.evaluate(async () => {
    const doors = Array.from(document.querySelectorAll(".cottage_doorset"));
    console.log(doors);

    for (const door of doors.entries()) {
      door.click();

      // if (doors.indexOf(door) > 1) {
      //   break;
      // }

    }
  });

  // await browser.close();
}
