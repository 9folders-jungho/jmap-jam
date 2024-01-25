import type { ExcludeValue, IncludeValue } from "./helpers";
import { Requests } from "./types/contracts";
import type { Invocation, JSONPointer } from "./types/jmap";
export type Ref<I = unknown> = ReturnType<InvocationDraft<I>["$ref"]>;
export type WithRevValues<T> = IncludeValue<T, Ref>;
export type WithoutRefValues<T> = ExcludeValue<T, Ref>;
/**
 * Symbol used to identify arguments that need to be transformed
 * into JMAP result references
 */
declare const r: unique symbol;
/**
 * These instances represent partially-formed method calls
 * used within `requestMany`. They are transformed into standard
 * JMAP method calls before being sent to the server.
 */
export declare class InvocationDraft<I = unknown> {
    #private;
    constructor(invocation: I);
    /**
     * Create a result reference that points to the result
     * of a previous invocation.
     */
    $ref(path: JSONPointer): {
        [r]: {
            path: `/${string}`;
            invocation: I;
        };
    };
    /**
     * Determine if a value is a result reference placeholder
     */
    static isRef<I = unknown>(value: unknown): value is Ref<I>;
    /**
     * Transform InvocationDraft instances into fully-formed JMAP method calls
     * by replacing result reference placeholders with JMAP result references
     * and applying user-provided IDs.
     */
    static createInvocationsFromDrafts<T extends Record<string, InvocationDraft>>(drafts: T): {
        methodCalls: Invocation[];
        methodNames: Set<string>;
    };
}
export type DraftsProxy = {
    [Entity in keyof Requests as Entity extends `${infer EntityName}/${string}` ? EntityName : never]: {
        [Method in Entity as Method extends `${string}/${infer MethodName}` ? MethodName : never]: <Args extends {
            [T in keyof Requests[Method]]: Requests[Method][T] | Ref;
        }>(args: Args) => InvocationDraft<[Method, Args]>;
    };
};
export declare function buildRequestsFromDrafts<R extends Record<string, InvocationDraft<unknown>>>(draftsFn: (p: DraftsProxy) => R): {
    methodCalls: Invocation[];
    methodNames: Set<string>;
};
export {};
//# sourceMappingURL=request-drafts.d.ts.map