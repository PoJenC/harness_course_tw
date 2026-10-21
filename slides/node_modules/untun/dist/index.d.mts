interface TunnelOptions {
  /**
   * The URL to which the tunnel should connect. The default is to construct a URL based on protocol, hostname and port.
   * @optional
   */
  url?: string;
  /**
   * The port number to use for the tunnel connection. Can be a string or a number. Defaults to 3000.
   * @optional
   */
  port?: number | string;
  /**
   * The host name for the tunnel connection. Defaults to localhost.
   * @optional
   */
  hostname?: string;
  /**
   * The protocol to use for the tunnel connection, either "http" or "https". Default is http.
   * @optional
   */
  protocol?: "http" | "https";
  /**
   * Specifies whether to enforce TLS verification. Default is true.
   * @optional
   */
  verifyTLS?: boolean;
  /**
   * Indicates whether the user accepts the Cloudflare Terms of Service for using cloudflared. Default is false.
   * @optional
   */
  acceptCloudflareNotice?: boolean;
  extraArgs?: Array<string>;
}
interface Tunnel {
  /**
   * Get the current URL of the active tunnel.
   * @returns {Promise<string>} A promise that resolves to the URL of the tunnel.
   */
  getURL: () => Promise<string>;
  /**
   * Close the active tunnel.
   * @returns {Promise<void>} A promise that will be resolved when the tunnel is successfully closed.
   */
  close: () => Promise<void>;
}
/**
 * Initialises and starts a network tunnel using cloudflared.
 * @param {TunnelOptions} opts - Configuration options for the tunnel.
 * @returns {Promise<undefined | Tunnel>} A promise that resolves to the tunnel instance, or undefined if the setup fails.
 * @throws {Error} If there are problems installing cloudflared or starting the tunnel.
 * @example
 * const tunnelOptions = {
 *  protocol: "https",
 *  port: "443",
 *  hostname: "example.com",
 *  verifyTLS: true,
 *  acceptCloudflareNotice: true
 * };
 * const tunnel = await startTunnel(tunnelOptions);
 * console.log(await tunnel.getURL());
 * await tunnel.close();
 */
declare function startTunnel(opts: TunnelOptions): Promise<undefined | Tunnel>;
export { Tunnel, TunnelOptions, startTunnel };