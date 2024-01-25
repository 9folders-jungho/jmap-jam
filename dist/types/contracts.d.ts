import type { Exact } from "type-fest";
import type { HasAllKeysOfRelated } from "../helpers";
import type { BlobCopyArguments, BlobCopyResponse, ChangesArguments, ChangesResponse, CopyArguments, CopyResponse, FilterCondition, FilterOperator, GetArguments, GetResponse, ID, Request as JMAPRequest, Response as JMAPResponse, ProblemDetails, QueryArguments, QueryChangesArguments, QueryChangesResponse, QueryResponse, SetArguments, SetError, SetResponse } from "./jmap";
import type { Email, EmailFilterCondition, EmailImport, EmailSubmission, EmailSubmissionFilterCondition, EmailWithoutHeaderKeys, Identity, Mailbox, MailboxFilterCondition, SearchSnippet, Thread, VacationResponse } from "./jmap-mail";
export type Requests = {
    "Core/echo": Record<string, any>;
    "Blob/copy": BlobCopyArguments;
    "PushSubscription/get": Omit<GetArguments<PushSubscription>, "accountId">;
    "PushSubscription/set": Omit<SetArguments<PushSubscription>, "accountId" | "ifInState">;
    "Mailbox/get": GetArguments<Mailbox>;
    "Mailbox/changes": ChangesArguments;
    "Mailbox/query": QueryArguments<Mailbox, MailboxFilterCondition> & {
        sortAsTree?: boolean;
        filterAsTree?: boolean;
    };
    "Mailbox/queryChanges": QueryChangesArguments<Mailbox, MailboxFilterCondition>;
    "Mailbox/set": SetArguments<Mailbox> & {
        onDestroyRemoveEmails?: boolean;
    };
    "Thread/get": GetArguments<Thread>;
    "Thread/changes": ChangesArguments;
    "Email/get": GetArguments<EmailWithoutHeaderKeys> & {
        bodyProperties?: Array<keyof EmailWithoutHeaderKeys>;
        fetchTextBodyValues?: boolean;
        fetchHTMLBodyValues?: boolean;
        fetchAllBodyValues?: boolean;
        maxBodyValueBytes?: number;
    };
    "Email/changes": ChangesArguments;
    "Email/query": QueryArguments<Email, EmailFilterCondition> & {
        collapseThreads?: boolean;
    };
    "Email/queryChanges": QueryChangesArguments<Email, EmailFilterCondition> & {
        collapseThreads?: boolean;
    };
    "Email/set": SetArguments<Omit<Email, "headers">>;
    "Email/copy": CopyArguments<Pick<Email, "id" | "mailboxIds" | "keywords" | "receivedAt">>;
    "Email/import": {
        accountId: ID;
        ifInState?: string | null;
        emails: Record<ID, EmailImport>;
    };
    "Email/parse": {
        accountId: ID;
        blobIds: ID[];
        properties?: Array<keyof Email>;
        bodyProperties?: Array<keyof Email>;
        fetchTextBodyValues?: boolean;
        fetchHTMLBodyValues?: boolean;
        fetchAllBodyValues?: boolean;
        maxBodyValueBytes?: number;
    };
    "SearchSnippet/get": {
        accountId: ID;
        filter?: FilterOperator<EmailFilterCondition> | FilterCondition<EmailFilterCondition> | null;
        emailIds: ID[];
    };
    "Identity/get": GetArguments<Identity>;
    "Identity/changes": ChangesArguments;
    "Identity/set": SetArguments<Identity>;
    "EmailSubmission/get": GetArguments<EmailSubmission>;
    "EmailSubmission/changes": ChangesArguments;
    "EmailSubmission/query": QueryArguments<EmailSubmission, EmailSubmissionFilterCondition>;
    "EmailSubmission/queryChanges": QueryChangesArguments<EmailSubmission, EmailSubmissionFilterCondition>;
    "EmailSubmission/set": SetArguments<EmailSubmission> & {
        onSuccessUpdateEmail?: Record<ID, Partial<Email>> | null;
        onSuccessDestroyEmail?: ID[] | null;
    };
    "VacationResponse/get": GetArguments<VacationResponse>;
    "VacationResponse/set": SetArguments<VacationResponse>;
};
export type Methods = keyof Requests;
export type Responses<A> = HasAllKeysOfRelated<Requests, {
    "Core/echo": A;
    "Blob/copy": BlobCopyResponse;
    "PushSubscription/get": Omit<GetResponse<PushSubscription, A>, "state" | "accountId">;
    "PushSubscription/set": Omit<SetResponse<PushSubscription>, "accountId" | "oldState" | "newState">;
    "Mailbox/get": GetResponse<Mailbox, A>;
    "Mailbox/changes": ChangesResponse & {
        updatedProperties: Array<keyof Mailbox> | null;
    };
    "Mailbox/query": QueryResponse;
    "Mailbox/queryChanges": QueryChangesResponse;
    "Mailbox/set": SetResponse<Mailbox>;
    "Thread/get": GetResponse<Thread, A>;
    "Thread/changes": ChangesResponse;
    "Email/get": GetResponse<Email, A>;
    "Email/changes": ChangesResponse;
    "Email/query": QueryResponse;
    "Email/queryChanges": QueryChangesResponse;
    "Email/set": SetResponse<Email>;
    "Email/copy": CopyResponse<Email>;
    "Email/import": {
        accountId: ID;
        oldState: string | null;
        newState: string;
        created: Record<ID, Email> | null;
        notCreated: Record<ID, SetError> | null;
    };
    "Email/parse": {
        accountId: ID;
        parsed: Record<ID, Email> | null;
        notParsable: ID[] | null;
        notFound: ID[] | null;
    };
    "SearchSnippet/get": {
        accountId: ID;
        list: SearchSnippet[];
        notFound: ID[] | null;
    };
    "Identity/get": GetResponse<Identity, A>;
    "Identity/changes": ChangesResponse;
    "Identity/set": SetResponse<Identity>;
    "EmailSubmission/get": GetResponse<EmailSubmission, A>;
    "EmailSubmission/changes": ChangesResponse;
    "EmailSubmission/query": QueryResponse;
    "EmailSubmission/queryChanges": QueryChangesResponse;
    "EmailSubmission/set": SetResponse<EmailSubmission>;
    "VacationResponse/get": GetResponse<VacationResponse, A>;
    "VacationResponse/set": SetResponse<VacationResponse>;
}>;
/**
 * Get the arguments for a method.
 */
export type GetArgs<Method extends Methods, T> = Exact<Requests[Method], T>;
/**
 * Get the response data for a method with specific arguments.
 */
export type GetResponseData<Method extends Methods, Args> = Responses<Args>[Method];
export type RequestOptions = {
    fetchInit?: RequestInit;
    using?: JMAPRequest["using"];
    createdIds?: JMAPRequest["createdIds"];
};
export type LocalInvocation<Method extends Methods, Args extends Exact<Requests[Method], Args>> = [Method, Args];
export type Meta = {
    sessionState: JMAPResponse["sessionState"];
    createdIds: JMAPResponse["createdIds"];
    response: Response;
};
export type GetResult<Data, HandleErrors extends "throw" | "return"> = HandleErrors extends "throw" ? Data : {
    data: Data;
    error: null;
} | {
    data: null;
    error: ProblemDetails;
};
/**
 * This is an interface for a Proxy-based API that functions similarly to this example:
 *
 * @example
 * ```ts
 * const api = {
 *   Email: {
 *     get: (args) => jam.request(["Email/get", args]),
 *     changes: (args) => jam.request(["Email/changes", args]),
 *     // ...
 *   },
 *   Mailbox: {
 *     get: (args) => jam.request(["Mailbox/get", args]),
 *     query: (args) => jam.request(["Mailbox/query", args]),
 *     // ...
 *   },
 *   // ...
 * }
 * ```
 */
export type ProxyAPI = {
    [Entity in keyof Requests as Entity extends `${infer EntityName}/${string}` ? EntityName : never]: {
        [Method in Entity as Method extends `${string}/${infer MethodName}` ? MethodName : never]: <A extends Requests[Method]>(args: A) => Promise<[Responses<A>[Method], Meta]>;
    };
};
//# sourceMappingURL=contracts.d.ts.map