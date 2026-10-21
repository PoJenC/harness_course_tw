import { ServerWithWSOptions, WSOptions } from "../_chunks/_types.mjs";
import { Server, ServerPlugin } from "srvx";
export declare function plugin(wsOpts: WSOptions): ServerPlugin;
export declare function serve(options: ServerWithWSOptions): Server;