const puppeteer = require('puppeteer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const { isValidUrl } = require('./utils/validate-url');
const { formatAllowedDisplay, formatAllowed } = require('./constants');

/**
 * Handle the screenshot capture process by setting up the browser and page,
 * capturing the screenshot,
 * and converting the PNG file to a PDF file if the format is PDF
 *
 * @param {Object} event
 * @param {Object} input
 * @param {string} input.url
 * @param {string} input.format
 * @returns {Promise<string>} The path to the screenshot or PDF file
 */
async function handleScreenshot(event, { url, format }) {
  try {
    validateInputData(url, format);

    const { browser, page } = await setupBrowserAndPage();

    const pathScreenshot = await captureScreenshot(page, url);

    await browser.close();

    if (formatAllowed[format] === 'pdf') {
      await convertPngToPdf(pathScreenshot);
    }

    return pathScreenshot;
  } catch (error) {
    throw Error(`An error occurred: ${error.message}`);
  }
}

async function setupBrowserAndPage() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1080 });

  return { browser, page };
}

/**
 * Capture a screenshot of the page and save
 *
 * @param {string} page
 * @param {string} pageUrl
 *
 * @returns {Promise<string>} The path to the screenshot file
 */
async function captureScreenshot(page, pageUrl) {
  await page.goto(pageUrl, { waitUntil: 'networkidle2' });

  const fileName = `screenshot-${Date.now()}.${formatAllowed.PNG}`;

  const pathScreenshot = path.join(__dirname, 'screenshot', fileName);

  await page.screenshot({
    path: pathScreenshot,
    type: formatAllowed.PNG,
    fullPage: true,
  });

  return pathScreenshot;
}

/**
 * Convert a PNG file to a PDF file
 *
 * @param {string} pngPath
 *
 * @returns {Promise<string>} The path to the PDF file
 */
async function convertPngToPdf(pngPath) {
  const pdfPath = pngPath.replace('.png', '.pdf');
  const doc = new PDFDocument({ size: 'A4' });
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);
  doc.image(pngPath, 0, 0, { fit: [595.28, 841.89] });
  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('error', (error) => {
      reject(new Error(`Error converting PNG to PDF: ${error.message}`));
    });

    writeStream.on('finish', async () => {
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

/**
 * Validate the input data, check if the URL is valid and if the format is allowed
 *
 * @param {string} pageUrl
 * @param {string} format
 *
 * @throws {Error} If the URL is invalid or the format is not allowed
 */
const validateInputData = (pageUrl, format) => {
  if (!isValidUrl(pageUrl)) {
    throw new Error('Invalid URL format');
  }

  if (!formatAllowed[format]) {
    throw new Error(
      `Invalid format: ${format}. Only format allowed: ${formatAllowedDisplay.join(
        ', '
      )}`
    );
  }
};

module.exports = {
  handleScreenshot,
  setupBrowserAndPage,
  captureScreenshot,
  validateInputData,
};
