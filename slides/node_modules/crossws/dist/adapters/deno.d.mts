import { Adapter, AdapterInstance } from "../_chunks/adapter.mjs";
import { DenoOptions } from "../_chunks/_options.mjs";
export interface DenoAdapter extends AdapterInstance {
  handleUpgrade(req: Request, info: ServeHandlerInfo): Promise<Response>;
}
type ServeHandlerInfo = {
  remoteAddr?: {
    transport?: string;
    hostname: string;
    port: number;
  };
};
declare const denoAdapter: Adapter<DenoAdapter, DenoOptions>;
export { type DenoOptions, denoAdapter as default };