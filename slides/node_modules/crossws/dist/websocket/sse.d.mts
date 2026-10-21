import { BinaryType, CloseEvent, Event, EventTarget, HeadersInit, MessageEvent, WebSocket, web_d_exports } from "../_chunks/web.mjs";
type Ctor<T> = {
  prototype: T;
  new (): T;
};
declare const _EventTarget: Ctor<EventTarget>;
export interface WebSocketSSEOptions {
  protocols?: string | string[];
  /** enabled by default */
  bidir?: boolean;
  /** enabled by default */
  stream?: boolean;
  headers?: HeadersInit;
}
export declare class WebSocketSSE extends _EventTarget implements WebSocket {
  #private;
  static CONNECTING: number;
  static OPEN: number;
  static CLOSING: number;
  static CLOSED: number;
  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null;
  onerror: ((this: WebSocket, ev: Event) => any) | null;
  onopen: ((this: WebSocket, ev: Event) => any) | null;
  onmessage: ((this: WebSocket, ev: MessageEvent<any>) => any) | null;
  binaryType: BinaryType;
  readyState: number;
  readonly url: string;
  readonly protocol: string;
  readonly extensions: string;
  readonly bufferedAmount: number;
  constructor(url: string, init?: string | string[] | WebSocketSSEOptions);
  close(_code?: number, _reason?: string): void;
  send(data: any): Promise<void>;
}