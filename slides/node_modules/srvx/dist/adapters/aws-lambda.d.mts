import { AWSLambdaContext, AWSLambdaProxyEvent, AWSLambdaProxyEventV2, AWSLambdaProxyResult, AWSLambdaProxyResultV2, FetchHandler, ServerOptions, TrustProxyOption } from "../_chunks/types.mjs";
type AWSLambdaResponseStream = NodeJS.WritableStream & {
  setContentType(contentType: string): void;
};
type MaybePromise<T> = T | Promise<T>;
export type AwsLambdaEvent = AWSLambdaProxyEvent | AWSLambdaProxyEventV2;
export type AWSLambdaHandler = (event: AwsLambdaEvent, context: AWSLambdaContext) => MaybePromise<AWSLambdaProxyResult | AWSLambdaProxyResultV2>;
export type AWSLambdaStreamingHandler = (event: AwsLambdaEvent, responseStream: AWSLambdaResponseStream, context: AWSLambdaContext) => MaybePromise<void>;
export declare function toLambdaHandler(options: ServerOptions): AWSLambdaHandler;
export declare function handleLambdaEvent(fetchHandler: FetchHandler, event: AwsLambdaEvent, context: AWSLambdaContext, trustProxy?: TrustProxyOption): Promise<AWSLambdaProxyResult | AWSLambdaProxyResultV2>;
export declare function handleLambdaEventWithStream(fetchHandler: FetchHandler, event: AwsLambdaEvent, responseStream: AWSLambdaResponseStream, context: AWSLambdaContext, trustProxy?: TrustProxyOption): Promise<void>;
export declare function invokeLambdaHandler(handler: AWSLambdaHandler, request: Request): Promise<Response>;
export type { AWSLambdaResponseStream };