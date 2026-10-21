import { transform } from 'esbuild';

function createJSMinifier() {
  return async (code) => {
    const result = await transform(code, { minify: true, loader: "js" });
    return result.code.trim();
  };
}

export { createJSMinifier };
