require("node:fs").mkdirSync("test-results", { recursive: true });
const { chromium } = require("playwright"),
  assert = require("assert");
(async () => {
  const b = await chromium.launch({
    ...(process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : {}),
    headless: true,
  });
  const p = await b.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  let errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const url = process.env.DEMO_URL || "file://" + process.cwd() + "/index.html";
  await p.goto(url);
  await p.waitForFunction(
    () =>
      document.querySelector("#character-animation-slot").dataset.media ===
      "gif-cropped",
  );
  await p.waitForTimeout(2000);
  const track = p.locator(".topic-track"),
    r = await track.boundingBox();
  await p.mouse.move(r.x + r.width - 35, r.y + 25);
  await p.mouse.down();
  await p.mouse.move(r.x + 60, r.y + 25, { steps: 15 });
  await p.mouse.up();
  assert((await track.evaluate((e) => e.scrollLeft)) > 40);
  assert.equal(
    await p.locator(".message.user").count(),
    0,
    "drag must not send a message",
  );
  await p.waitForTimeout(300);
  await p.getByRole("button", { name: "穿搭推荐", exact: true }).click();
  await p.waitForFunction(
    () => document.querySelector("#screen").dataset.phase === "task",
  );
  await p.getByRole("button", { name: "停止回复", exact: true }).click();
  await p.getByRole("button", { name: "继续生成", exact: true }).click();
  await p.waitForFunction(
    () => document.querySelector("#screen").dataset.phase === "result",
  );
  assert.equal(await p.locator(".outfit-look").count(), 3);
  await p.evaluate(
    () => (document.querySelector(".conversation").scrollTop = 0),
  );
  const hint = p.locator('[data-node-id="23:91"]');
  const y1 = (await hint.boundingBox()).y;
  await p.evaluate(
    () => (document.querySelector(".conversation").scrollTop = 150),
  );
  const y2 = (await hint.boundingBox()).y;
  assert(y2 < y1 - 60, "history cue must scroll with content");
  await p.evaluate(
    () => (document.querySelector(".conversation").scrollTop = 0),
  );
  await hint.click();
  assert(
    await p.getByRole("dialog", { name: "历史对话", exact: true }).isVisible(),
  );
  await p.getByRole("button", { name: "关闭", exact: true }).click();
  await p.getByRole("button", { name: "切换角色", exact: true }).click();
  await p.getByRole("button", { name: /光屿.*聊一聊/ }).click();
  await p.getByRole("button", { name: "切换角色", exact: true }).click();
  await p.getByRole("button", { name: /芒小果.*聊一聊/ }).click();
  await p.waitForFunction(
    () =>
      document.querySelector("#character-animation-slot").dataset.media ===
      "gif-cropped",
  );
  await p.waitForTimeout(1900);
  await p.screenshot({
    path: process.env.RELEASE_SCREENSHOT || "test-results/release-preview.png",
  });
  for (const [w, h] of [
    [375, 667],
    [430, 932],
    [1440, 1000],
  ]) {
    await p.setViewportSize({ width: w, height: h });
    await p.waitForFunction(() => {
      const r = document.querySelector("#viewport").getBoundingClientRect();
      return r.y >= -0.1 && r.bottom <= innerHeight + 0.5;
    });
    const bounds = await p.locator("#viewport").boundingBox();
    assert(bounds.y >= -0.1 && bounds.y + bounds.height <= h + 0.5);
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
  }
  assert.equal(
    await p.evaluate(
      () =>
        [...document.images].filter((i) => !i.complete || !i.naturalWidth)
          .length,
    ),
    0,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS mouse dragging without accidental send; outfit stop/resume/result; scrolling history cue; modal and role returns; loop; viewport fit; images; no script errors",
  );
  await b.close();
})();
