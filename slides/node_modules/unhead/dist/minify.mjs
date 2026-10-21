function minifyCSS(code) {
  if (!/[\s/]|;\}|0\.\d/.test(code))
    return code;
  let result = "";
  let last = "";
  let i = 0;
  let parenDepth = 0;
  const len = code.length;
  const append = (value) => {
    result += value;
    last = value;
  };
  while (i < len) {
    const ch = code[i];
    if (ch === "'" || ch === '"') {
      const quote = ch;
      append(ch);
      i++;
      while (i < len && code[i] !== quote) {
        if (code[i] === "\\" && i + 1 < len)
          append(code[i++]);
        append(code[i++]);
      }
      if (i < len)
        append(code[i++]);
    } else if (ch === "/" && code[i + 1] === "*") {
      i += 2;
      while (i < len && !(code[i] === "*" && code[i + 1] === "/"))
        i++;
      i += 2;
    } else if (ch === "(") {
      parenDepth++;
      append(ch);
      i++;
    } else if (ch === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      append(ch);
      i++;
    } else if (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
      while (i < len && (code[i] === " " || code[i] === "	" || code[i] === "\n" || code[i] === "\r"))
        i++;
      const next = code[i];
      if (next === "!")
        continue;
      if (parenDepth > 0) {
        if (last && next && !isCSSCalcPunctuation(last) && !isCSSCalcPunctuation(next))
          append(" ");
      } else if (last && next && !isCSSPunctuation(last) && !isCSSPunctuation(next)) {
        append(" ");
      }
    } else if (ch === ";") {
      let j = i + 1;
      while (j < len && (code[j] === " " || code[j] === "	" || code[j] === "\n" || code[j] === "\r"))
        j++;
      if (code[j] === "}") {
        i++;
      } else {
        append(ch);
        i++;
      }
    } else if (ch === "0" && code[i + 1] === "." && code[i + 2] >= "0" && code[i + 2] <= "9") {
      if (last && last >= "0" && last <= "9") {
        append(ch);
        i++;
      } else {
        i++;
      }
    } else {
      append(ch);
      i++;
    }
  }
  return result.trim();
}
function isCSSPunctuation(ch) {
  return ch === "{" || ch === "}" || ch === ";" || ch === ":" || ch === "," || ch === ">" || ch === "~" || ch === "+" || ch === "(" || ch === ")";
}
function isCSSCalcPunctuation(ch) {
  return ch === "*" || ch === "/" || ch === "(" || ch === ")" || ch === ",";
}

function minifyJS(code) {
  if (!/[\s/]/.test(code))
    return code;
  let result = "";
  let last = "";
  let i = 0;
  const len = code.length;
  const append = (value) => {
    result += value;
    last = value;
  };
  while (i < len) {
    const ch = code[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      const quote = ch;
      append(ch);
      i++;
      while (i < len && code[i] !== quote) {
        if (code[i] === "\\" && i + 1 < len) {
          append(code[i++]);
        }
        append(code[i++]);
      }
      if (i < len)
        append(code[i++]);
    } else if (ch === "/" && code[i + 1] === "/") {
      i += 2;
      while (i < len && code[i] !== "\n")
        i++;
    } else if (ch === "/" && code[i + 1] === "*") {
      i += 2;
      while (i < len && !(code[i] === "*" && code[i + 1] === "/"))
        i++;
      i += 2;
    } else if (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
      let hasNewline = false;
      while (i < len && (code[i] === " " || code[i] === "	" || code[i] === "\n" || code[i] === "\r")) {
        if (code[i] === "\n")
          hasNewline = true;
        i++;
      }
      const next = code[i];
      if (hasNewline && last && next && last !== "{" && last !== "}" && last !== ";" && next !== "}" && next !== ";")
        append("\n");
      else if (last && next && isIdentChar(last) && isIdentChar(next))
        append(" ");
      else if (last && next && (last === "+" && next === "+" || last === "-" && next === "-"))
        append(" ");
    } else {
      append(ch);
      i++;
    }
  }
  return result.trim();
}
function isIdentChar(ch) {
  return ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z" || ch >= "0" && ch <= "9" || ch === "_" || ch === "$";
}

function isJsonWhitespace(char) {
  return char === " " || char === "\n" || char === "\r" || char === "	";
}
function minifyJSON(code) {
  let escaped = false;
  let inString = false;
  let segmentStart = 0;
  let chunks;
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if (inString) {
      if (escaped)
        escaped = false;
      else if (char === "\\")
        escaped = true;
      else if (char === '"')
        inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (isJsonWhitespace(char)) {
      chunks ||= [];
      if (segmentStart < i)
        chunks.push(code.slice(segmentStart, i));
      segmentStart = i + 1;
    }
  }
  if (!chunks)
    return code;
  try {
    JSON.parse(code);
  } catch {
    return code;
  }
  if (segmentStart < code.length)
    chunks.push(code.slice(segmentStart));
  return chunks.join("");
}

export { minifyCSS, minifyJS, minifyJSON };
