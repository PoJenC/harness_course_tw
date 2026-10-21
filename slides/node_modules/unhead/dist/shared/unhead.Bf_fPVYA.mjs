const hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(object, key) {
  return hasOwnProperty.call(object, key);
}

export { hasOwn as h };
