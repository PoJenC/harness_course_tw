import { minify } from 'rolldown/experimental';

function createJSMinifier() {
  return async (code) => {
    const result = await minify("inline.js", code);
    return result.code.trim();
  };
}

export { createJSMinifier };
