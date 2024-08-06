const puppeteer = require('puppeteer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const { isValidUrl } = require('./utils/validate-url');
const { formatAllowedDisplay, formatAllowed } = require('./constants');

const STORAGE_FOLDER_NAME = 'screenshot';
const DIR_PATH = path.join(__dirname, STORAGE_FOLDER_NAME);
const PDF_SIZE = 'A4';
const PDF_DIMENSIONS = [595.28, 841.89];
const VIEWPORT_DIMENSIONS = { width: 1920, height: 1080 };

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
    createFolderStorage();
    validateInputData(url, format);

    const { browser, page } = await setupBrowserAndPage();

    const pathScreenshot = await captureScreenshot(page, url);

    await browser.close();

    if (formatAllowed[format] === formatAllowed.PDF)
      return convertPngToPdf(pathScreenshot);

    return pathScreenshot;
  } catch (error) {
    throw Error(`An error occurred: ${error.message}`);
  }
}

const createFolderStorage = () => {
  if (!fs.existsSync(DIR_PATH)) {
    fs.mkdirSync(DIR_PATH, { recursive: true });
  }
};

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

const setupBrowserAndPage = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport(VIEWPORT_DIMENSIONS);

  return { browser, page };
};

/**
 * Capture a screenshot of the page and save
 *
 * @param {string} page
 * @param {string} pageUrl
 *
 * @returns {Promise<string>} The path to the screenshot file
 */
const captureScreenshot = async (page, pageUrl) => {
  await page.goto(pageUrl, { waitUntil: 'networkidle2' });

  const fileName = `${STORAGE_FOLDER_NAME}-${Date.now()}.${formatAllowed.PNG}`;

  const pathScreenshot = path.join(DIR_PATH, fileName);

  await page.screenshot({
    path: pathScreenshot,
    type: formatAllowed.PNG,
    fullPage: true,
  });

  return pathScreenshot;
};

/**
 * Convert a PNG file to a PDF file
 *
 * @param {string} pngPath
 *
 * @returns {Promise<string>} The path to the PDF file
 */
const convertPngToPdf = async (pngPath) => {
  const pdfPath = pngPath.replace(formatAllowed.PNG, formatAllowed.PDF);
  const doc = new PDFDocument({ size: PDF_SIZE });
  const writeStream = fs.createWriteStream(pdfPath);

  doc.pipe(writeStream);
  doc.image(pngPath, 0, 0, { fit: PDF_DIMENSIONS });
  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      fs.unlinkSync(pngPath); // Delete the original PNG file
      resolve(pdfPath);
    });
    writeStream.on('error', (error) => {
      reject(new Error(`Error converting PNG to PDF: ${error.message}`));
    });
  });
};

module.exports = {
  handleScreenshot,
  setupBrowserAndPage,
  captureScreenshot,
  validateInputData,
};
