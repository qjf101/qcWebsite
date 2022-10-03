const path = require('path');
const fs = require('fs');

const cache = new Map();

const getHtml = path => new Promise((resolve, reject) =>
  fs.readFile(path, 'utf-8', (err, contents) => {
    if (err) return reject(err);

    cache.set(path, contents);
    return resolve(contents);
  }));

const csp = (page, nonce) => async (req, res, next) => {
  const pagePath = path.join('./', page);
  let html = cache.get(pagePath);
  if (!html) {
    html = await getHtml(pagePath);
  }
  res.header(
    'Content-Security-Policy',
    `default-src 'self' 'nonce-${nonce}'; font-src 'self' 'nonce-${nonce}' https://fonts.gstatic.com; img-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com; frame-src 'self'`
  );
  newHTML = html.replace(/ncn/g, `nonce="${nonce}"`);

  res.send(newHTML);
}

module.exports = csp;