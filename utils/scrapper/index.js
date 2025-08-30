const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

async function scrape(url, options = {}) {
  try {
    // 1. Try direct JSON (API-like response)
    const apiRes = await tryApiFetch(url);
    if (apiRes) {
      return { type: "api", data: apiRes };
    }

    // 2. Try static HTML
    const staticRes = await tryStaticScrape(url);
    if (staticRes) {
      return { type: "static", data: staticRes };
    }

    // 3. Fallback: dynamic (JS-heavy site)
    const dynamicRes = await tryDynamicScrape(url);
    return { type: "dynamic", data: dynamicRes };
  } catch (err) {
    throw new Error(`Scraping failed: ${err.message}`);
  }
}

async function tryApiFetch(url) {
  try {
    const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (res.headers["content-type"].includes("application/json")) {
      return res.data;
    }
    return null;
  } catch {
    return null;
  }
}

async function tryStaticScrape(url) {
    try {
      const res = await axios.get(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const $ = cheerio.load(res.data);
  
      const rawText = $("body").text();
  
      // Clean the text
      const cleanText = rawText
        .replace(/\s+/g, " ")   // collapse whitespace/newlines
        .replace(/[{}+]+/g, "") // remove unwanted symbols
        .trim();
  
      return {
        html: res.data,
        text: cleanText,
        title: $("title").text().trim(),
      };
    } catch {
      return null;
    }
  }
  

  async function tryDynamicScrape(url) {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle2" });
  
      const html = await page.content();
      const $ = cheerio.load(html);
  
      const rawText = $("body").text();
  
      // Clean the text
      const cleanText = rawText
        .replace(/\s+/g, " ")   // collapse whitespace/newlines
        .replace(/[{}+]+/g, "") // remove unwanted symbols
        .trim();
  
      const data = {
        html,
        text: cleanText,
        title: $("title").text().trim(),
      };
  
      await browser.close();
      return data;
    } catch (err) {
      throw new Error("Dynamic scrape failed: " + err.message);
    }
  }
  
// Export functions
module.exports = { scrape };
