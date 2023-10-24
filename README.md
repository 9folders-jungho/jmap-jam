<div align="center">
  <img alt="Jam Illustration" src="./JMAP-Jam.png" height="100" />
  <h1 align="center">Jam: A JMAP Client</h1>
</div>

A tiny (&lt;2kb gzipped), typed JMAP client with zero runtime dependencies, adhering to the following IETF standards:

- [RFC 8620][jmap-rfc] - JMAP
- [RFC 8621][jmap-mail-rfc] - JMAP for Mail

> [!IMPORTANT]
> Version `0.x` is considered unstable. Breaking changes may occur until version `1.0` is published.

### To-do

- [ ] [RFC 8887][jmap-ws-rfc] - JMAP Subprotocol for WebSocket

[jmap-rfc]: https://datatracker.ietf.org/doc/html/rfc8620
[jmap-mail-rfc]: https://datatracker.ietf.org/doc/html/rfc8621
[jmap-ws-rfc]: https://datatracker.ietf.org/doc/html/rfc8887

### Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Making Requests](#making-requests)
  - [Notes on Concurrency](#notes-on-concurrency)
- [TypeScript](#typescript)
- [API Reference](#api-reference)
  - [`#session`](#session)
  - [`#api.<entity>.<operation>()`](#apientityoperation)
  - [`request()`](#request)
  - [`getPrimaryAccount()`](#getprimaryaccount)
  - [`downloadBlob()`](#downloadblob)
  - [`uploadBlob()`](#uploadblob)
  - [`connectEventSource()`](#connecteventsource)

## Installation

Jam works in any environment that supports the [Web Fetch API][mdn-using-fetch] and ES Modules, including Node.js (`>=18`) and the browser.

Use as a package:

```sh
npm install jmap-jam
```

Use in the browser:

```html
<script type="module">
  import JamClient from "https://your-preferred-cdn.com/jmap-jam@<version>";
</script>
```

[mdn-using-fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

## Getting Started

To initialize a client, provide the session URL for a JMAP server to connect to, as well as a bearer token for authenticating requests.

```ts
import JamClient from "jmap-jam";

const jam = new JamClient({
  sessionUrl: "https://jmap.example.com/.well-known/jmap",
  bearerToken: "super-secret-token",
});
```

### Making Requests

[JMAP][jmap-rfc] is a meta protocol that makes performing multiple, dependent operations on a server more efficient by accepting batches of them in a single HTTP request.

A request is made up of one or more [invocations][jmap-3.2] that each specify a method, arguments, and a method call ID (an arbitrary string chosen by the requester). Method calls can [reference each other][jmap-3.7-result-refs] with this ID, allowing for complex requests to be made.

To learn more about requests in JMAP, see the following resources:

- [JMAP Guides](https://jmap.io/spec.html) (JMAP website)
- [Standard Methods and Naming Conventions][jmap-5] (RFC 8620 § 5)
- [Entities and Methods for Mail][jmap-mail-rfc] (RFC 8621)

[jmap-5]: https://datatracker.ietf.org/doc/html/rfc8620#section-5

#### Individual Requests

Here's what a single request looks like with Jam:

```ts
const jam = new JamClient({ ... });

// Using convenience methods
const [mailboxes] = await jam.api.Mailbox.get({ accountId: "123" });

// Using a plain request
const [mailboxes] = await jam.request(["Mailbox/get",{ accountId: "123" }]);
```

Both of these methods output the same JMAP request:

<!-- prettier-ignore -->
```jsonc
{
  "using": ["urn:ietf:params:jmap:mail"],
  "methodCalls": [
    [
      "Mailbox/get", // <------------ Method name
      { "accountId": "123" }, // <--- Arguments
      "r1" // <------------- Method call ID (autogenerated)
    ],
  ]
}
```

Convenience methods for available JMAP entities (e.g. Email, Mailbox, Thread) are available through the [`api`](#apientityoperation) property.

Or, as seen in the example, requests can be made without convenience methods by using the [`request`](#request) method directly.

Both methods of sending requests have strongly typed responses and can be used interchangeably.

#### Multiple Requests

> Though JMAP examples often show multiple method calls being used in a single request, see the [Notes on Concurrency](#notes-on-concurrency) section for information about why a single method call per request can sometimes be preferred.

To send multiple method calls in a single request, use `requestMany`.

```ts
const jam = new JamClient({ ... });

const accountId = '<account-id>';
const mailboxId = '<mailbox-id>';

const [{ emails }, meta] = await jam.requestMany((t) => {
  // Get the first 10 email IDs in the mailbox
  const emailIds = t.Email.query({
    accountId,
    filter: {
      inMailbox: mailboxId,
    },
    limit: 10,
  });

  // Get the emails with those IDs
  const emails = t.Email.get({
    accountId,
    ids: emailIds.$ref("/ids"), // Using a result reference
    properties: ["id", "htmlBody"],
  });

  return { emailIds, emails };
});
```

This produces the following JMAP request:

```jsonc
{
  "using": ["urn:ietf:params:jmap:mail"],
  "methodCalls": [
    [
      "Email/query",
      {
        "accountId": "<account-id>",
        "filter": {
          "inMailbox": "<mailbox-id>"
        }
      },
      "emailIds"
    ],
    [
      "Email/get",
      {
        "accountId": "<account-id>",
        "#ids": {
          "name": "Email/query",
          "resultOf": "emailIds",
          "path": "/ids"
        },
        "properties": ["id", "htmlBody"]
      },
      "emails"
    ]
  ]
}
```

The `t` argument used in the `requestMany` callback is a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) that lets _invocation drafts_ be defined before they are assembled into an actual JMAP request sent to the server.

To create a [result reference][jmap-3.7-result-refs] between invocations, use the `$ref` method on the invocation draft to be referenced.

#### Request Options

When making requests, you can pass an optional `options` object as the second argument to `request`, `requestMany`, or any of the convenience methods. This object accepts the following properties:

- `fetchInit` - An object that will be passed to the Fetch API `fetch` method as the second argument. This can be used to set headers, change the HTTP method, etc. It can also be provided to the `JamClient` constructor to set default options for all requests.
- `createdIds` - A object containing client-specified creation IDs mapped IDs the server
  assigned when each record was successfully created.
- `using` - An array of additional JMAP capabilities to include when making the request. This can be used to include non-standard capabilities that are supported by the server.

#### Response Metadata

Convenience methods, `request`, and `requestMany` all return a two-item tuple that contains the response data and metadata.

```ts
const [mailboxes, meta] = await jam.api.Mailbox.get({ accountId: "123" });
const { sessionState, createdIds, response } = meta;
```

The meta object contains the following properties:

- `sessionState` - The current session state.
- `createdIds` - A map of method call IDs to the IDs of any objects created by the server in response to the request.
- `response` - The actual Fetch API `Response`.

[jmap-3.2]: https://datatracker.ietf.org/doc/html/rfc8620#section-3.2
[jmap-3.7-result-refs]: https://datatracker.ietf.org/doc/html/rfc8620#section-3.7

### Notes on Concurrency

> [RFC 8620 § 3.10][jmap-3.10]: Method calls within a single request MUST be executed in order \[by the server]. However, method calls from different concurrent API requests may be interleaved. This means that the data on the server may change between two method calls within a single API request.

JMAP supports passing multiple method calls in a single request, but it is important to remember that each method call will be executed in sequence, not concurrently.

[jmap-3.10]: https://datatracker.ietf.org/doc/html/rfc8620#section-3.10

## TypeScript

Jam provides types for JMAP methods, arguments, and responses as described in the [JMAP][jmap-rfc] and [JMAP Mail][jmap-mail-rfc] RFCs.

All convenience methods, `request`, and `requestMany` will reveal autosuggested types for method names (e.g. `Email/get`), the arguments for that method, and the appropriate response.

Many response types will infer from arguments. For example, when using an argument field such as `properties` to filter fields in a response, the response type will be narrowed to exclude fields that were not included.

## API Reference

### `#api.<entity>.<operation>()`

A convenience pattern for making individual JMAP requests that uses the [`request`](#request) method under the hood.

```js
const [mailboxes] = await jam.api.Mailbox.get({
  accountId,
});

const [emails] = await jam.api.Email.get({
  accountId,
  ids: ["email-123"],
  properties: ["subject"],
});
```

### `request()`

Send a standard JMAP request.

```ts
const [mailboxes] = await jam.request(["Mailbox/get", { accountId }]);

const [emails] = await jam.request([
  "Email/get",
  {
    accountId,
    ids: ["email-123"],
    properties: ["subject"],
  },
]);
```

### `requestMany()`

Send a JMAP request with multiple method calls.

```js
const [{ emailIds, emails }] = await jam.requestMany((r) => {
  const emailIds = r.Email.query({
    accountId,
    filter: {
      inMailbox: mailboxId,
    },
  });

  const emails = r.Email.get({
    accountId,
    ids: emailIds.$ref("/ids"),
    properties: ["id", "htmlBody"],
  });

  return { emailIds, emails };
});
```

### `#session`

Get the client's current session.

```js
const session = await client.session;
```

### `getPrimaryAccount()`

Get the ID of the primary mail account for the current session.

```js
const accountId = await client.getPrimaryAccount();
```

### `downloadBlob()`

Intiate a fetch request to download a specific blob. Downloading a blob requires both a [MIME type](https://developer.mozilla.org/en-US/docs/Glossary/MIME_type) and file name, since JMAP server implementations are not required to store this information.

If the JMAP server sets a `Content-Type` header in its response, it will use the value provided in `mimeType`.

If the JMAP server sets a `Content-Disposition` header in its response, it will use the value provided in `fileName`.

```js
const response = await client.downloadBlob({
  accountId,
  blobId: 'blob-123'
  mimeType: 'image/png'
  fileName: 'photo.png'
});

const blob = await response.blob();
// or response.arrayBuffer()
// or response.text()
// ...etc
```

### `uploadBlob()`

Initiate a fetch request to upload a blob.

```js
const data = await client.uploadBlob(
  accountId,
  new Blob(["hello world"], { type: "text/plain" })
);
console.log(data); // =>
// {
//   accountId: "account-abcd",
//   blobId: "blob-123",
//   type: "text/plain",
//   size: 152,
// }
```

### `connectEventSource()`

Connect to a JMAP event source using [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).

> [!NOTE]
> At the time of this writing, the popular JMAP server host Fastmail has not implemented support for server-sent events.

```js
const sse = await client.connectEventSource({
  types: "*", // or ["Mailbox", "Email", ...]
  ping: 5000, // ping interval in milliseconds
  closeafter: "no", // or "state"
});

sse.addEventListener("message", (event) => ...));
sse.addEventListener("error", (event) => ...));
sse.addEventListener("close", (event) => ...));
```
