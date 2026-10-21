const VALID_STREAM_KEY_RE = /^[$_a-z][$\w]*$/i;
function parseStreamKey(streamKey) {
  if (typeof streamKey !== "string" || !VALID_STREAM_KEY_RE.test(streamKey)) {
    throw new Error(
      `[unhead] Invalid streamKey: must be a valid JavaScript identifier matching ${VALID_STREAM_KEY_RE}. Received: ${JSON.stringify(streamKey)}`
    );
  }
  return streamKey;
}

export { parseStreamKey as p };
