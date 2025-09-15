// import { TextEncoder, TextDecoder } from "util";
import { TextEncoder } from "util";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}

// if (typeof global.TextDecoder === "undefined") {
//   global.TextDecoder = TextDecoder;
// }

// src/setupTests.ts

// ✅ Polyfill for HTMLFormElement.prototype.requestSubmit
if (!HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function () {
    this.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
  };
}
