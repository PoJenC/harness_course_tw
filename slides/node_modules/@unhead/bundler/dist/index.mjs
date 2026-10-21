export { InferSeoMetaPlugin } from 'unhead/plugins';

const DefaultCriticalTags = {
  htmlAttrs: {
    lang: "en"
  },
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" }
  ]
};

function devtoolsPlugin() {
  return (head) => {
    return {
      key: "devtools",
      hooks: {
        "entries:normalize": function({ tags, entry }) {
          const source = entry.options?._source;
          if (!source)
            return;
          for (const tag of tags) {
            if (!tag._source)
              tag._source = source;
          }
        },
        "ssr:render": function(ctx) {
          if (!head.ssr)
            return;
          const entries = [];
          for (const [id, entry] of head.entries) {
            let input = {};
            try {
              input = JSON.parse(JSON.stringify(entry.input || {}, (_k, v) => {
                if (typeof v === "function")
                  return `\u0192 ${v.name || "anonymous"}()`;
                if (typeof v === "undefined")
                  return "\u2298 undefined";
                return v;
              }));
            } catch {
            }
            entries.push({
              id,
              source: entry.options?._source,
              input,
              tagCount: (entry._tags || []).length,
              mode: "server"
            });
          }
          const tags = [];
          for (const tag of ctx.tags) {
            if (tag.props?.id === "unhead:devtools" || tag.props?.id === "unhead:payload")
              continue;
            tags.push({
              tag: tag.tag,
              props: { ...tag.props },
              innerHTML: tag.innerHTML,
              textContent: tag.textContent,
              position: tag.tagPosition,
              priority: tag._w,
              dedupeKey: tag._d,
              source: tag._source,
              mode: "server"
            });
          }
          ctx.tags = [...ctx.tags, {
            tag: "script",
            // Escape `<` so a serialized `<\/script>` cannot close the inline JSON block early
            innerHTML: JSON.stringify({ entries, tags }).replace(/</g, "\\u003C"),
            props: { id: "unhead:devtools", type: "application/json" }
          }];
        }
      }
    };
  };
}

export { DefaultCriticalTags, devtoolsPlugin };
