import { defineComponent, ref } from 'vue';
import { u as useHead } from './shared/vue.CXwiCT15.mjs';
import 'unhead/plugins';
import 'unhead/utils';
import './shared/vue.DKb5ZKVl.mjs';
import './shared/vue.D2XR8FqS.mjs';

function extractTextContent(children) {
  if (!children)
    return void 0;
  if (typeof children === "string")
    return children;
  if (Array.isArray(children)) {
    const first = children[0];
    if (typeof first === "string")
      return first;
    if (first && typeof first === "object" && "children" in first)
      return extractTextContent(first.children);
  }
  return void 0;
}
function addVNodeToHeadObj(node, obj) {
  const nodeType = node.type;
  const type = nodeType === "html" ? "htmlAttrs" : nodeType === "body" ? "bodyAttrs" : nodeType;
  if (typeof type !== "string" || !(type in obj))
    return;
  const props = { ...node.props || {} };
  const innerKey = type === "script" ? "innerHTML" : "textContent";
  if (props.children !== void 0) {
    props[innerKey] = props.children;
    delete props.children;
  }
  if (node.children) {
    const textContent = extractTextContent(node.children);
    if (textContent !== void 0)
      props[innerKey] = textContent;
  }
  if (Array.isArray(obj[type]))
    obj[type].push(props);
  else if (type === "title")
    obj.title = props.textContent ?? props.innerHTML;
  else
    obj[type] = props;
}
function vnodesToHeadObj(nodes) {
  const obj = {
    title: void 0,
    htmlAttrs: void 0,
    bodyAttrs: void 0,
    base: void 0,
    meta: [],
    link: [],
    style: [],
    script: [],
    noscript: []
  };
  for (const node of nodes) {
    if (typeof node.type === "symbol" && Array.isArray(node.children)) {
      for (const childNode of node.children)
        addVNodeToHeadObj(childNode, obj);
    } else {
      addVNodeToHeadObj(node, obj);
    }
  }
  return obj;
}
const Head = /* @__PURE__ */ defineComponent({
  name: "Head",
  setup(_, { slots }) {
    const obj = ref({});
    useHead(obj);
    return () => {
      obj.value = slots.default ? vnodesToHeadObj(slots.default()) : {};
      return null;
    };
  }
});

export { Head };
