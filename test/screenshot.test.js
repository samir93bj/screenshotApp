// test/screenshot.test.js
const assert = require("assert");
const sinon = require("sinon");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const { setupBrowserAndPage, captureScreenshot } = require("../src/screenshot");
const { formatAllowed } = require("../src/constants");

describe("screenshot.js", () => {
  let browserStub, pageStub;

  beforeEach(() => {
    browserStub = sinon.stub(puppeteer, "launch").resolves({
      newPage: sinon.stub().resolves({
        setViewport: sinon.stub().resolves(),
        goto: sinon.stub().resolves(),
        screenshot: sinon.stub().resolves(),
      }),
      close: sinon.stub().resolves(),
    });

    pageStub = {
      setViewport: sinon.stub().resolves(),
      goto: sinon.stub().resolves(),
      screenshot: sinon.stub().resolves(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("setupBrowserAndPage", () => {
    it("should setup browser and page correctly", async () => {
      const { browser, page } = await setupBrowserAndPage();

      assert.strictEqual(browserStub.calledOnce, true);
      assert.strictEqual(
        page.setViewport.calledOnceWith({ width: 1920, height: 1080 }),
        true
      );
    });
  });

  describe("captureScreenshot", () => {
    it("should capture a screenshot and save it", async () => {
      const pageUrl = "http://example.com";
      const fileName = `screenshot-${Date.now()}.${formatAllowed.PNG}`;
      const pathScreenshot = path.join(__dirname, "..", "screenshot", fileName);

      sinon.stub(path, "join").returns(pathScreenshot);
      sinon.stub(fs, "writeFileSync").returns();

      await captureScreenshot(pageStub, pageUrl);

      assert.strictEqual(
        pageStub.goto.calledOnceWith(pageUrl, { waitUntil: "networkidle2" }),
        true
      );

      assert.strictEqual(
        pageStub.screenshot.calledOnceWith({
          path: pathScreenshot,
          type: formatAllowed.PNG,
          fullPage: true,
        }),
        true
      );
    });
  });
});
