import type { Invocation, ProblemDetails } from "./types/jmap";
/**
 * Expands a URI template with the given parameters.
 *
 * [rfc6570](https://datatracker.ietf.org/doc/html/rfc6570)
 */
export declare function expandURITemplate(template: string, params: Record<string, string>): URL;
export declare function isErrorInvocation(input: Invocation): input is Invocation<ProblemDetails>;
export declare function getErrorFromInvocation<T extends Invocation>(invocation: T): ProblemDetails | null;
/**
 * Note: This could be more defensive, but for now I'm willing to trust that JMAP
 * servers will follow the specs (meaning: each method call will have a response
 * with a matching ID, no duplicates, etc. if the status code is 2xx)
 */
export declare function getResultsForMethodCalls(methodCallResponses: Array<Invocation<any>>, { returnErrors }: {
    returnErrors: boolean;
}): {
    [k: string]: any;
};
export type Obj = Record<string, unknown>;
export type InvocationTemplate<T> = T extends [infer Name, infer Data] ? [Name, Data, string] : never;
export type HasAllKeysOfRelated<R extends Record<string | number | symbol, unknown>, T extends Record<keyof R, unknown>> = T;
export type IncludeValue<T, V> = {
    [K in keyof T]: T[K] | V;
};
export type ExcludeValue<T, V> = {
    [K in keyof T]: Exclude<T[K], V>;
};
//# sourceMappingURL=helpers.d.ts.map