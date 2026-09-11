const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);

  // Fill with a vibrant gradient & rounded emblem
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Gradient from Indigo (#6366f1) to Pink (#ec4899)
        const t = (x + y) / (width + height);
        const r = Math.round(99 * (1 - t) + 236 * t);
        const g = Math.round(102 * (1 - t) + 72 * t);
        const b = Math.round(241 * (1 - t) + 153 * t);

        buffer[idx] = r;     // R
        buffer[idx + 1] = g; // G
        buffer[idx + 2] = b; // B
        buffer[idx + 3] = 255; // A
      } else {
        // Transparent outside circle
        buffer[idx] = 9;
        buffer[idx + 1] = 13;
        buffer[idx + 2] = 22;
        buffer[idx + 3] = 255;
      }
    }
  }

  // Create scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    scanlines[y * (1 + width * 4)] = 0; // Filter None
    buffer.copy(
      scanlines,
      y * (1 + width * 4) + 1,
      y * width * 4,
      (y + 1) * width * 4
    );
  }

  const idatData = zlib.deflateSync(scanlines);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(8 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    const crc = calcCRC(buf.subarray(4, 8 + len));
    buf.writeInt32BE(crc, 8 + len);
    return buf;
  }

  function calcCRC(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        const bit = (byte ^ crc) & 1;
        crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
        byte >>>= 1;
      }
    }
    return crc ^ -1;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPNG(192, 192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPNG(512, 512));
console.log('Icons successfully generated!');
