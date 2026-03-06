# Contoh Penggunaan Web-Downloader

## Instalasi

```bash
npm install web-downloader
```

## Basic Usage

### Download HTML Sederhana

```javascript
const WebDownloader = require('web-downloader');

const downloader = new WebDownloader();

async function contohDownload() {
  const result = await downloader.downloadHTML('https://example.com');
  
  if (result.success) {
    console.log('Title:', result.title);
    console.log('Jumlah Links:', result.links.length);
    console.log('Jumlah Gambar:', result.images.length);
  } else {
    console.log('Error:', result.error);
  }
}

contohDownload();
```

### Download File

```javascript
const WebDownloader = require('web-downloader');

const downloader = new WebDownloader();

async function downloadGambar() {
  const result = await downloader.downloadFile(
    'https://example.com/gambar.jpg',
    './downloads/gambar.jpg'
  );
  
  if (result.success) {
    console.log(`File tersimpan di: ${result.outputPath}`);
    console.log(`Ukuran: ${result.size} bytes`);
  }
}

downloadGambar();
```

### Multiple Downloads

```javascript
const WebDownloader = require('web-downloader');

const downloader = new WebDownloader();

async function downloadBanyak() {
  const urls = [
    'https://api1.example.com',
    'https://api2.example.com',
    'https://api3.example.com'
  ];
  
  const results = await downloader.downloadMultiple(urls);
  
  results.forEach((result, index) => {
    console.log(`URL ${index + 1}: ${result.success ? 'Berhasil' : 'Gagal'}`);
  });
}

downloadBanyak();
```

## Custom Options

```javascript
const downloader = new WebDownloader({
  timeout: 30000,
  headers: {
    'User-Agent': 'Custom Bot 1.0',
    'Authorization': 'Bearer token123'
  }
});
```
