// Node.js script to generate logo files
const fs = require('fs');
const { createCanvas } = require('canvas');

function createLogo(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#4361ee';
  ctx.fillRect(0, 0, size, size);
  
  // Book shape
  ctx.fillStyle = '#ffffff';
  const bookWidth = size * 0.6;
  const bookHeight = size * 0.5;
  const offsetX = (size - bookWidth) / 2;
  const offsetY = (size - bookHeight) / 2;
  
  // Book cover
  ctx.fillRect(offsetX, offsetY, bookWidth, bookHeight);
  
  // Book spine
  ctx.fillStyle = '#3f37c9';
  ctx.fillRect(offsetX, offsetY, bookWidth * 0.15, bookHeight);
  
  // Text "E" for E-Library
  ctx.fillStyle = '#3f37c9';
  ctx.font = `bold ${size * 0.35}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', size / 2 + size * 0.05, size / 2);
  
  return canvas.toBuffer('image/png');
}

// Generate logo192.png
fs.writeFileSync('logo192.png', createLogo(192));
console.log('Generated logo192.png');

// Generate logo512.png
fs.writeFileSync('logo512.png', createLogo(512));
console.log('Generated logo512.png'); 