"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/store-utils.ts
var store_utils_exports = {};
__export(store_utils_exports, {
  createStoreAdapter: () => createStoreAdapter,
  flattenToPointers: () => flattenToPointers,
  immutableSetByPath: () => immutableSetByPath
});
module.exports = __toCommonJS(store_utils_exports);

// src/types.ts
var import_zod = require("zod");
var DynamicValueSchema = import_zod.z.union([
  import_zod.z.string(),
  import_zod.z.number(),
  import_zod.z.boolean(),
  import_zod.z.null(),
  import_zod.z.object({ $state: import_zod.z.string() })
]);
var DynamicStringSchema = import_zod.z.union([
  import_zod.z.string(),
  import_zod.z.object({ $state: import_zod.z.string() })
]);
var DynamicNumberSchema = import_zod.z.union([
  import_zod.z.number(),
  import_zod.z.object({ $state: import_zod.z.string() })
]);
var DynamicBooleanSchema = import_zod.z.union([
  import_zod.z.boolean(),
  import_zod.z.object({ $state: import_zod.z.string() })
]);
function unescapeJsonPointer(token) {
  return token.replace(/~1/g, "/").replace(/~0/g, "~");
}
function parseJsonPointer(path) {
  const raw = path.startsWith("/") ? path.slice(1).split("/") : path.split("/");
  return raw.map(unescapeJsonPointer);
}
function getByPath(obj, path) {
  if (!path || path === "/") {
    return obj;
  }
  const segments = parseJsonPointer(path);
  let current = obj;
  for (const segment of segments) {
    if (current === null || current === void 0) {
      return void 0;
    }
    if (Array.isArray(current)) {
      const index = parseInt(segment, 10);
      current = current[index];
    } else if (typeof current === "object") {
      current = current[segment];
    } else {
      return void 0;
    }
  }
  return current;
}
var SPEC_DATA_PART = "spec";
var SPEC_DATA_PART_TYPE = `data-${SPEC_DATA_PART}`;

// src/state-store.ts
function immutableSetByPath(root, path, value) {
  const segments = parseJsonPointer(path);
  if (segments.length === 0) return root;
  const result = { ...root };
  let current = result;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    const child = current[seg];
    if (Array.isArray(child)) {
      current[seg] = [...child];
    } else if (child !== null && typeof child === "object") {
      current[seg] = { ...child };
    } else {
      const nextSeg = segments[i + 1];
      current[seg] = nextSeg !== void 0 && /^\d+$/.test(nextSeg) ? [] : {};
    }
    current = current[seg];
  }
  const lastSeg = segments[segments.length - 1];
  if (Array.isArray(current)) {
    if (lastSeg === "-") {
      current.push(value);
    } else {
      current[parseInt(lastSeg, 10)] = value;
    }
  } else {
    current[lastSeg] = value;
  }
  return result;
}
function createStoreAdapter(config) {
  return {
    get(path) {
      return getByPath(config.getSnapshot(), path);
    },
    set(path, value) {
      const current = config.getSnapshot();
      if (getByPath(current, path) === value) return;
      config.setSnapshot(immutableSetByPath(current, path, value));
    },
    update(updates) {
      let next = config.getSnapshot();
      let changed = false;
      for (const [path, value] of Object.entries(updates)) {
        if (getByPath(next, path) !== value) {
          next = immutableSetByPath(next, path, value);
          changed = true;
        }
      }
      if (!changed) return;
      config.setSnapshot(next);
    },
    getSnapshot: config.getSnapshot,
    getServerSnapshot: config.getSnapshot,
    subscribe: config.subscribe
  };
}
var MAX_FLATTEN_DEPTH = 20;
function flattenToPointers(obj, prefix = "", _depth = 0, _seen, _warned) {
  const seen = _seen ?? /* @__PURE__ */ new Set();
  const warned = _warned ?? { current: false };
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const pointer = `${prefix}/${key}`;
    if (_depth < MAX_FLATTEN_DEPTH && value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype && !seen.has(value)) {
      seen.add(value);
      Object.assign(
        result,
        flattenToPointers(
          value,
          pointer,
          _depth + 1,
          seen,
          warned
        )
      );
    } else {
      if (process.env.NODE_ENV !== "production" && !warned.current && _depth >= MAX_FLATTEN_DEPTH && value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype && !seen.has(value)) {
        warned.current = true;
        console.warn(
          `flattenToPointers: depth limit (${MAX_FLATTEN_DEPTH}) reached. Nested state beyond this depth will be treated as a leaf value.`
        );
      }
      result[pointer] = value;
    }
  }
  return result;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createStoreAdapter,
  flattenToPointers,
  immutableSetByPath
});
//# sourceMappingURL=store-utils.js.map