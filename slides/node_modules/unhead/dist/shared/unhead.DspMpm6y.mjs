const BACKSLASH_RE = /\\/g;
const LT_RE = /</g;
const DOUBLE_QUOTE_RE = /"/g;
const TOKEN_RE = /%\w+(?:\.\w+)?/g;
const SepSub = "%separator";
function sub(p, token, isJson = false) {
  let val;
  if (token === "s" || token === "pageTitle") {
    val = p.pageTitle;
  } else if (token.includes(".")) {
    const dotIndex = token.indexOf(".");
    val = p[token.substring(0, dotIndex)]?.[token.substring(dotIndex + 1)];
  } else {
    val = p[token];
  }
  if (val !== void 0) {
    const str = typeof val === "number" ? String(val) : String(val || "");
    return isJson ? str.replace(BACKSLASH_RE, "\\\\").replace(LT_RE, "\\u003C").replace(DOUBLE_QUOTE_RE, '\\"') : str;
  }
  return void 0;
}
function processTemplateParams(s, p, sep, isJson = false) {
  if (typeof s !== "string" || !s.includes("%"))
    return s;
  let decoded = s;
  try {
    decoded = decodeURI(s);
  } catch {
  }
  const tokens = decoded.match(TOKEN_RE);
  if (!tokens) {
    return s;
  }
  const hasSepSub = s.includes(SepSub);
  s = s.replace(TOKEN_RE, (token) => {
    if (token === SepSub || !tokens.includes(token)) {
      return token;
    }
    const re = sub(p, token.slice(1), isJson);
    return re !== void 0 ? re : token;
  }).trim();
  if (hasSepSub) {
    s = s.split(SepSub).map((part) => part.trim()).filter((part) => part !== "").join(sep ? ` ${sep} ` : " ");
  }
  return s;
}

export { processTemplateParams as p };
