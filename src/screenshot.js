const puppeteer = require("puppeteer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { isValidUrl } = require("./utils/validate-url");
const { formatAllowedDisplay, formatAllowed } = require("./constants");

async function setupBrowserAndPage() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  return { browser, page };
}

async function captureScreenshot(page, pageUrl) {
  await page.goto(pageUrl, { waitUntil: "networkidle2" });
  const fileName = `screenshot-${Date.now()}.${formatAllowed.PNG}`;
  const pathScreenshot = path.join(__dirname, "screenshot", fileName);
  await page.screenshot({
    path: pathScreenshot,
    type: formatAllowed.PNG,
    fullPage: true,
  });
  return pathScreenshot;
}

async function convertPngToPdf(pngPath) {
  const pdfPath = pngPath.replace(".png", ".pdf");
  const doc = new PDFDocument({ size: "A4" });
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);
  doc.image(pngPath, 0, 0, { fit: [595.28, 841.89] });
  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on("error", (error) => {
      reject(new Error(`Error converting PNG to PDF: ${error.message}`));
    });

    writeStream.on("finish", async () => {
      fs.unlink(pngPath, (error) => {
        if (error) {
          reject(new Error(`Error deleting PNG file: ${error.message}`));
        } else {
          resolve(pdfPath);
        }
      });
    });
  });
}

const validateInputData = (pageUrl, format) => {
  if (!isValidUrl(pageUrl)) {
    throw new Error("Invalid URL format");
  }

  if (!formatAllowed[format]) {
    throw new Error(
      `Invalid format: ${format}. Only format allowed: ${formatAllowedDisplay.join(
        ", "
      )}`
    );
  }
};

async function handleScreenshot(event, { url, format }) {
  try {
    validateInputData(url, format);

    const { browser, page } = await setupBrowserAndPage();

    const pathScreenshot = await captureScreenshot(page, url);

    await browser.close();

    if (formatAllowed[format] === "pdf") {
      await convertPngToPdf(pathScreenshot);
    }

    return pathScreenshot;
  } catch (error) {
    throw Error(`An error occurred: ${error.message}`);
  }
}

module.exports = { handleScreenshot };
