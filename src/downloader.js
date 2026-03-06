const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

class WebDownloader {
  constructor(options = {}) {
    this.options = {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      ...options
    };
  }

  /**
   * Download konten dari URL
   * @param {string} url - URL yang akan didownload
   * @param {Object} options - Opsi tambahan untuk request
   * @returns {Promise<Object>} - Hasil download
   */
  async download(url, options = {}) {
    try {
      const requestOptions = {
        ...this.options,
        ...options,
        url: url,
        method: options.method || 'GET',
        responseType: options.responseType || 'text'
      };

      const response = await axios(requestOptions);
      
      return {
        success: true,
        url: url,
        statusCode: response.status,
        headers: response.headers,
        data: response.data,
        contentType: response.headers['content-type']
      };
    } catch (error) {
      return this.handleError(error, url);
    }
  }

  /**
   * Download dan parse HTML
   * @param {string} url - URL yang akan didownload
   * @returns {Promise<Object>} - Hasil dengan DOM yang sudah diparse
   */
  async downloadHTML(url) {
    const result = await this.download(url);
    
    if (result.success && result.contentType.includes('text/html')) {
      result.$ = cheerio.load(result.data);
      result.title = result.$('title').text();
      result.links = this.extractLinks(result.$, url);
      result.images = this.extractImages(result.$, url);
    }
    
    return result;
  }

  /**
   * Download file dan simpan ke disk
   * @param {string} url - URL file yang akan didownload
   * @param {string} outputPath - Path untuk menyimpan file
   * @returns {Promise<Object>} - Hasil download
   */
  async downloadFile(url, outputPath) {
    try {
      const response = await axios({
        url: url,
        method: 'GET',
        responseType: 'stream',
        ...this.options
      });

      // Buat direktori jika belum ada
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });

      // Simpan file
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          resolve({
            success: true,
            url: url,
            outputPath: outputPath,
            size: response.headers['content-length']
          });
        });
        writer.on('error', reject);
      });
    } catch (error) {
      return this.handleError(error, url);
    }
  }

  /**
   * Ekstrak links dari HTML
   * @param {Object} $ - Cheerio object
   * @param {string} baseUrl - Base URL untuk links relatif
   * @returns {Array} - Array of links
   */
  extractLinks($, baseUrl) {
    const links = [];
    $('a[href]').each((i, elem) => {
      const href = $(elem).attr('href');
      links.push({
        text: $(elem).text().trim(),
        href: this.normalizeUrl(href, baseUrl)
      });
    });
    return links;
  }

  /**
   * Ekstrak images dari HTML
   * @param {Object} $ - Cheerio object
   * @param {string} baseUrl - Base URL untuk images relatif
   * @returns {Array} - Array of image info
   */
  extractImages($, baseUrl) {
    const images = [];
    $('img[src]').each((i, elem) => {
      const src = $(elem).attr('src');
      images.push({
        alt: $(elem).attr('alt') || '',
        src: this.normalizeUrl(src, baseUrl)
      });
    });
    return images;
  }

  /**
   * Normalisasi URL (relatif ke absolut)
   * @param {string} url - URL yang akan dinormalisasi
   * @param {string} base - Base URL
   * @returns {string} - URL absolut
   */
  normalizeUrl(url, base) {
    if (url.startsWith('http')) {
      return url;
    }
    
    try {
      const baseUrl = new URL(base);
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  }

  /**
   * Handle error dari request
   * @param {Error} error - Error object
   * @param {string} url - URL yang gagal didownload
   * @returns {Object} - Object error
   */
  handleError(error, url) {
    return {
      success: false,
      url: url,
      error: {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText
      }
    };
  }

  /**
   * Download multiple URLs secara parallel
   * @param {Array<string>} urls - Array of URLs
   * @param {Object} options - Opsi untuk download
   * @returns {Promise<Array>} - Array hasil download
   */
  async downloadMultiple(urls, options = {}) {
    const promises = urls.map(url => this.download(url, options));
    return Promise.all(promises);
  }
}

module.exports = WebDownloader;
