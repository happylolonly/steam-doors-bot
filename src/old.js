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


const fs = require("fs");

const { promisify } = require("util");

const writeFile = promisify(fs.writeFile);


function delay(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}
