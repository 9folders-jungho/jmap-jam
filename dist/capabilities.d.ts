/**
 * Entities associated with their JMAP capability identifiers.
 */
export declare const knownCapabilities: {
    Core: string;
    Mailbox: string;
    Thread: string;
    Email: string;
    SearchSnippet: string;
    Identity: string;
    EmailSubmission: string;
    VacationResponse: string;
};
/**
 * Given a list of method names, determine the entities and provide the capabilities
 * that are required to operate on them.
 */
export declare function getCapabilitiesForMethodCalls({ methodNames, availableCapabilities, }: {
    methodNames: Iterable<string>;
    availableCapabilities: ReadonlyMap<string, string>;
}): Set<string>;
//# sourceMappingURL=capabilities.d.ts.map