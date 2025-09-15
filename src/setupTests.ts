// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
global.TextEncoder = require("util").TextEncoder;

Object.defineProperty(window.URL, "createObjectURL", {
  writable: true,
  configurable: true,
  value: jest.fn(() => "blob-url:mock"),
});

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: () => ({
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => new ImageData(1, 1),
    putImageData: () => {},
    createImageData: () => new ImageData(1, 1),
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: (): TextMetrics => ({
      width: 100,
      actualBoundingBoxAscent: 0,
      actualBoundingBoxDescent: 0,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: 0,
      fontBoundingBoxAscent: 0,
      fontBoundingBoxDescent: 0,
      emHeightAscent: 0,
      emHeightDescent: 0,
      hangingBaseline: 0,
      alphabeticBaseline: 0,
      ideographicBaseline: 0,
    }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  }),
});
