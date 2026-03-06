const WebDownloader = require('../src/downloader');
const fs = require('fs').promises;
const path = require('path');

describe('WebDownloader', () => {
  let downloader;

  beforeEach(() => {
    downloader = new WebDownloader();
  });

  test('should create instance with default options', () => {
    expect(downloader).toBeInstanceOf(WebDownloader);
    expect(downloader.options.timeout).toBe(10000);
    expect(downloader.options.maxRedirects).toBe(5);
  });

  test('should handle invalid URL', async () => {
    const result = await downloader.download('https://invalid-url-12345.com');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('should extract links from HTML', () => {
    const html = '<html><body><a href="https://example.com">Link</a></body></html>';
    const $ = require('cheerio').load(html);
    const links = downloader.extractLinks($, 'https://example.com');
    
    expect(links).toHaveLength(1);
    expect(links[0].text).toBe('Link');
    expect(links[0].href).toBe('https://example.com');
  });

  test('should normalize relative URLs', () => {
    const normalized = downloader.normalizeUrl('/test', 'https://example.com');
    expect(normalized).toBe('https://example.com/test');
  });

  test('should handle absolute URLs in normalize', () => {
    const normalized = downloader.normalizeUrl('https://other.com', 'https://example.com');
    expect(normalized).toBe('https://other.com');
  });
});
