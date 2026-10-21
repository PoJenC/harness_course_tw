import { createEventEmitter } from "./events.mjs";
import { nanoid } from "./nanoid.mjs";
//#region src/utils/streaming-channel.ts
const DEFAULT_HIGH_WATER_MARK = 256;
var StreamClosedError = class extends Error {
	name = "StreamClosedError";
};
/**
* Build a server-side stream sink. RPC-agnostic; the RPC host wires
* `events.on('chunk' | 'end')` to broadcast, and reads `buffer` to replay
* for late or reconnecting subscribers.
*/
function createStreamSink(options = {}) {
	const id = options.id ?? nanoid();
	const replayWindow = Math.max(0, options.replayWindow ?? 0);
	const events = createEventEmitter();
	const controller = new AbortController();
	const buffer = [];
	let closed = false;
	let lastSeq = 0;
	function write(chunk) {
		if (closed) throw new StreamClosedError(`Cannot write to a closed stream "${id}"`);
		lastSeq += 1;
		if (replayWindow > 0) {
			buffer.push({
				seq: lastSeq,
				chunk
			});
			if (buffer.length > replayWindow) {
				if (buffer.length - replayWindow === 1) buffer.shift();
				else buffer.splice(0, buffer.length - replayWindow);
			}
		}
		events.emit("chunk", lastSeq, chunk);
	}
	function error(reason) {
		if (closed) return;
		closed = true;
		const payload = toErrorPayload(reason);
		controller.abort(reason);
		events.emit("end", payload);
	}
	function close() {
		if (closed) return;
		closed = true;
		if (!controller.signal.aborted) controller.abort("stream closed");
		events.emit("end", void 0);
	}
	function abort(reason) {
		if (closed) return;
		if (!controller.signal.aborted) controller.abort(reason ?? "aborted");
	}
	const writable = new WritableStream({
		write(chunk) {
			write(chunk);
		},
		close() {
			close();
		},
		abort(reason) {
			error(reason);
		}
	});
	return {
		id,
		signal: controller.signal,
		get closed() {
			return closed;
		},
		get lastSeq() {
			return lastSeq;
		},
		write,
		error,
		close,
		abort,
		writable,
		events,
		buffer
	};
}
/**
* Build a client-side stream reader. RPC-agnostic; the RPC host calls
* `_push(seq, chunk)` on each incoming chunk and `_end(error?)` on the
* terminal frame. Consumers iterate with `for await` or pipe `readable`.
*/
function createStreamReader(options = {}) {
	const id = options.id ?? nanoid();
	const highWaterMark = Math.max(1, options.highWaterMark ?? DEFAULT_HIGH_WATER_MARK);
	const queue = [];
	let lastSeenSeq = 0;
	let done = false;
	let cancelled = false;
	let endError;
	let pending;
	let pullController;
	let readableInstance;
	function drainNext() {
		if (!pending) return;
		if (queue.length > 0) {
			const value = queue.shift();
			const r = pending;
			pending = void 0;
			r.resolve({
				value,
				done: false
			});
			return;
		}
		if (done) {
			const r = pending;
			pending = void 0;
			if (endError) {
				const err = new Error(endError.message);
				err.name = endError.name;
				r.reject(err);
			} else r.resolve({
				value: void 0,
				done: true
			});
		}
	}
	function feedReadable() {
		if (!pullController) return;
		while (queue.length > 0) {
			const v = queue.shift();
			try {
				pullController.enqueue(v);
			} catch {
				break;
			}
		}
		if (done && pullController) {
			try {
				if (endError) {
					const err = new Error(endError.message);
					err.name = endError.name;
					pullController.error(err);
				} else pullController.close();
			} catch {}
			pullController = void 0;
		}
	}
	function push(seq, chunk) {
		if (done || cancelled) return;
		if (seq <= lastSeenSeq) return;
		lastSeenSeq = seq;
		queue.push(chunk);
		if (queue.length > highWaterMark) {
			const overflow = queue.length - highWaterMark;
			queue.splice(0, overflow);
			options.onOverflow?.(overflow);
		}
		drainNext();
		if (readableInstance) feedReadable();
	}
	function end(error) {
		if (done) return;
		done = true;
		endError = error;
		drainNext();
		if (readableInstance) feedReadable();
	}
	function cancel() {
		if (cancelled || done) return;
		cancelled = true;
		options.onCancel?.();
		end(void 0);
	}
	function getReadable() {
		if (readableInstance) return readableInstance;
		readableInstance = new ReadableStream({
			start(controller) {
				pullController = controller;
				feedReadable();
			},
			cancel() {
				cancel();
			}
		});
		return readableInstance;
	}
	return {
		id,
		get cancelled() {
			return cancelled;
		},
		get done() {
			return done;
		},
		get lastSeenSeq() {
			return lastSeenSeq;
		},
		get readable() {
			return getReadable();
		},
		cancel,
		_push: push,
		_end: end,
		[Symbol.asyncIterator]() {
			return {
				next() {
					if (queue.length > 0) return Promise.resolve({
						value: queue.shift(),
						done: false
					});
					if (done) {
						if (endError) {
							const err = new Error(endError.message);
							err.name = endError.name;
							return Promise.reject(err);
						}
						return Promise.resolve({
							value: void 0,
							done: true
						});
					}
					return new Promise((resolve, reject) => {
						pending = {
							resolve,
							reject
						};
					});
				},
				return() {
					cancel();
					return Promise.resolve({
						value: void 0,
						done: true
					});
				}
			};
		}
	};
}
function toErrorPayload(reason) {
	if (reason instanceof Error) return {
		name: reason.name || "Error",
		message: reason.message
	};
	if (typeof reason === "string") return {
		name: "Error",
		message: reason
	};
	try {
		return {
			name: "Error",
			message: JSON.stringify(reason)
		};
	} catch {
		return {
			name: "Error",
			message: String(reason)
		};
	}
}
//#endregion
export { createStreamReader, createStreamSink };
