import { transform } from 'lightningcss';

function createCSSMinifier() {
  return async (code) => {
    const result = transform({
      filename: "inline.css",
      code: new TextEncoder().encode(code),
      minify: true
    });
    return new TextDecoder().decode(result.code).trim();
  };
}

export { createCSSMinifier };
