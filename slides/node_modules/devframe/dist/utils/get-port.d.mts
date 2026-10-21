//#region ../../node_modules/.pnpm/get-port-please@3.2.0/node_modules/get-port-please/dist/index.d.mts
interface GetPortOptions {
  name: string;
  random: boolean;
  port: number;
  ports: number[];
  portRange: [fromInclusive: number, toInclusive: number];
  alternativePortRange: [fromInclusive: number, toInclusive: number];
  host: string;
  verbose?: boolean;
  public?: boolean;
}
type GetPortInput = Partial<GetPortOptions> | number | string;
type PortNumber = number;
declare function getPort(_userOptions?: GetPortInput): Promise<PortNumber>;
//#endregion
export { type GetPortInput, type GetPortOptions, getPort };