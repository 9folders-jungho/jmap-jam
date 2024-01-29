import { EventSourcePolyfill } from "event-source-polyfill";
import { WithRevValues, WithoutRefValues, type DraftsProxy, type InvocationDraft } from "./request-drafts";
import { type GetArgs, type GetResponseData, type LocalInvocation, type Meta, type Methods, type ProxyAPI, type RequestOptions } from "./types/contracts";
import type * as JMAP from "./types/jmap";
import type * as JMAPMail from "./types/jmap-mail";
export type ClientConfig = {
    /**
     * The tokenType used to authenticate all requests. (bearer, basic, jwt ...)
     */
    tokenType: string;
    /**
     * The bearer token used to authenticate all requests
     */
    token: string;
    /**
     * The URL of the JMAP session resources
     */
    sessionUrl: string;
    /**
     * A map of custom entities and their required capability identifiers
     *
     * @example
     * ```
     * const client = createClient({
     *   customCapabilities: {
     *     "Sandwich": "urn:bigco:params:jmap:sandwich",
     *     "TextMessage": "foo:bar:jmap:sms",
     *     "Spaceship": "myspaceship-jmap-urn",
     *   },
     * });
     * ```
     */
    customCapabilities?: Record<string, string>;
};
export declare class JamClient<Config extends ClientConfig = ClientConfig> {
    /**
     * Headers to send with every request
     */
    authHeader: string;
    /**
     * All available capabilities (known and custom)
     */
    capabilities: Map<string, string>;
    /**
     * An immediately fetched session promise
     */
    session: Promise<JMAP.Session>;
    constructor(config: Config);
    /**
     * Retrieve fresh session data
     */
    static loadSession(sessionUrl: string, authHeader: string): Promise<any>;
    /**
     * Send a JMAP request containing a single method call
     */
    request<Method extends Methods, Args extends GetArgs<Method, Args>, Data extends GetResponseData<Method, Args>>([method, args]: LocalInvocation<Method, Args>, options?: RequestOptions): Promise<[Data, Meta]>;
    requestMany<DraftsFn extends (b: DraftsProxy) => {
        [id: string]: InvocationDraft;
    }, Returning extends ReturnType<DraftsFn>>(draftsFn: DraftsFn, options?: RequestOptions): Promise<[
        {
            [MethodId in keyof Returning]: Returning[MethodId] extends InvocationDraft<infer Inv extends [Methods, WithRevValues<Record<string, any>>]> ? GetResponseData<Inv[0], WithoutRefValues<Inv[1]>> : never;
        },
        Meta
    ]>;
    /**
     * Get the ID of the primary mail account for the current session
     */
    getPrimaryAccount(): Promise<string>;
    /**
     * Upload a blob
     */
    uploadBlob(accountId: JMAP.BlobUploadParams["accountId"], body: BodyInit, fetchInit?: RequestInit): Promise<JMAP.BlobUploadResponse>;
    /**
     * Download a blob
     */
    downloadBlob(options: {
        accountId: JMAP.BlobDownloadParams["accountId"];
        blobId: JMAP.BlobDownloadParams["blobId"];
        mimeType: JMAP.BlobDownloadParams["type"];
        fileName: JMAP.BlobDownloadParams["name"];
    }, fetchInit?: RequestInit): Promise<Response>;
    /**
     * Initiate an event source to subscribe to server-sent events
     */
    connectEventSource(options: {
        types: "*" | Array<JMAPMail.Entity>;
        ping: number;
        closeafter?: JMAP.EventSourceArguments["closeafter"];
    }): Promise<EventSourcePolyfill>;
    /**
     * A fluent API using {entity}.{operation} syntax
     *
     * @example
     * ```ts
     * const [emails] = await jam.api.Email.get({
     *   accountId,
     *   ids,
     *   properties,
     * });
     *
     * const [mailboxes] = await jam.api.Mailbox.query({
     *   accountId,
     *   filter: { name: "Inbox" },
     * });
     * ```
     */
    get api(): ProxyAPI;
    static isProblemDetails(value: unknown): value is JMAP.ProblemDetails;
}
//# sourceMappingURL=client.d.ts.map