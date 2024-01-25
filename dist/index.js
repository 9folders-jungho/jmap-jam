var __accessCheck=(obj,member,msg)=>{if(!member.has(obj))throw TypeError("Cannot "+msg)};var __privateGet=(obj,member,getter)=>(__accessCheck(obj,member,"read from private field"),getter?getter.call(obj):member.get(obj)),__privateAdd=(obj,member,value)=>{if(member.has(obj))throw TypeError("Cannot add the same private member more than once");member instanceof WeakSet?member.add(obj):member.set(obj,value)},__privateSet=(obj,member,value,setter)=>(__accessCheck(obj,member,"write to private field"),setter?setter.call(obj,value):member.set(obj,value),value);var knownCapabilities={Core:"urn:ietf:params:jmap:core",Mailbox:"urn:ietf:params:jmap:mail",Thread:"urn:ietf:params:jmap:mail",Email:"urn:ietf:params:jmap:mail",SearchSnippet:"urn:ietf:params:jmap:mail",Identity:"urn:ietf:params:jmap:submission",EmailSubmission:"urn:ietf:params:jmap:submission",VacationResponse:"urn:ietf:params:jmap:vacationresponse"},entityMatcher=/^(\w+)\//;function getCapabilitiesForMethodCalls({methodNames,availableCapabilities}){var _a;let capabilities=new Set;for(let method of methodNames){let entity=(_a=entityMatcher.exec(method))==null?void 0:_a[1];if(entity){let capability=availableCapabilities.get(entity);capability&&capabilities.add(capability)}}return capabilities}function expandURITemplate(template,params){let expanded=template;for(let[key,value]of Object.entries(params)){let parameter="{"+key+"}";if(!expanded.includes(parameter))throw new Error(`Template "${template}" is missing parameter: ${key}`);expanded=expanded.replaceAll(parameter,value)}return new URL(expanded)}function isErrorInvocation(input){return input[0]==="error"}function getErrorFromInvocation(invocation){return isErrorInvocation(invocation)?invocation[1]:null}function getResultsForMethodCalls(methodCallResponses,{returnErrors}){return Object.fromEntries(methodCallResponses.map(([name,data,id])=>returnErrors?name==="error"?[id,{data:null,error:data}]:[id,{data,error:null}]:[id,data]))}var r=Symbol("Result Reference"),_invocation,_InvocationDraft=class _InvocationDraft{constructor(invocation){__privateAdd(this,_invocation,void 0);__privateSet(this,_invocation,invocation)}$ref(path){return{[r]:{path,invocation:__privateGet(this,_invocation)}}}static isRef(value){return typeof value=="object"&&value!==null&&r in value}static createInvocationsFromDrafts(drafts){let methodNames=new Set,invocationToId=new Map;return{methodCalls:Object.entries(drafts).map(([id,draft])=>{let[method,inputArgs]=__privateGet(draft,_invocation);invocationToId.set(__privateGet(draft,_invocation),id),methodNames.add(method);let args=Object.fromEntries(Object.entries(inputArgs).map(([key,value])=>{if(_InvocationDraft.isRef(value)){let{invocation,path}=value[r];return[`#${key}`,{name:invocation[0],resultOf:invocationToId.get(invocation),path}]}return[key,value]}));return[method,args,id]}),methodNames}}};_invocation=new WeakMap;var InvocationDraft=_InvocationDraft;function buildRequestsFromDrafts(draftsFn){let draftsProxy=new Proxy({},{get:(_,entity)=>new Proxy({},{get:(__,operation)=>args=>{let invocation=[`${entity}/${operation}`,args];return new InvocationDraft(invocation)}})}),drafts=draftsFn(draftsProxy);return InvocationDraft.createInvocationsFromDrafts(drafts)}var JamClient=class _JamClient{constructor(config){var _a;this.authHeader=`${config.tokenType} ${config.token}`,this.capabilities=new Map([...Object.entries((_a=config.customCapabilities)!=null?_a:{}),...Object.entries(knownCapabilities)]),this.session=_JamClient.loadSession(config.sessionUrl,this.authHeader,config.httpHeaders)}static async loadSession(sessionUrl,authHeader,httpHeaders){return fetch(sessionUrl,{headers:{Authorization:authHeader,Accept:"application/json",...httpHeaders||{}},cache:"no-cache"}).then(res=>res.json())}async request([method,args],options){var _a;let{using=[],fetchInit,createdIds:createdIdsInput}=options!=null?options:{},invocation=[method,args,"r1"],body={using:[...getCapabilitiesForMethodCalls({methodNames:[method],availableCapabilities:this.capabilities}),...using],methodCalls:[invocation],createdIds:createdIdsInput},{apiUrl}=await this.session,response=await fetch(apiUrl,{method:"POST",headers:{Authorization:this.authHeader,Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(body),...fetchInit});if(!response.ok){let error2;throw(_a=response.headers.get("Content-Type"))!=null&&_a.includes("json")?error2=await response.json():error2=await response.text(),error2}let{methodResponses:[methodResponse],sessionState,createdIds}=await response.json(),error=getErrorFromInvocation(methodResponse);if(error)throw error;return[methodResponse[1],{sessionState,createdIds,response}]}async requestMany(draftsFn,options={}){var _a;let{using=[],fetchInit,createdIds:createdIdsInput}=options,{methodCalls,methodNames}=buildRequestsFromDrafts(draftsFn),body={using:[...getCapabilitiesForMethodCalls({methodNames,availableCapabilities:this.capabilities}),...using],methodCalls,createdIds:createdIdsInput},{apiUrl}=await this.session,response=await fetch(apiUrl,{method:"POST",headers:{Authorization:this.authHeader,Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(body),...fetchInit});if(!response.ok){let error;throw(_a=response.headers.get("Content-Type"))!=null&&_a.includes("json")?error=await response.json():error=await response.text(),error}let{methodResponses,sessionState,createdIds}=await response.json(),meta={sessionState,createdIds,response},errors=methodResponses.map(getErrorFromInvocation).filter(e=>e!==null);if(errors.length>0)throw errors;return[getResultsForMethodCalls(methodResponses,{returnErrors:!1}),meta]}async getPrimaryAccount(){var _a;return(_a=(await this.session).primaryAccounts)==null?void 0:_a["urn:ietf:params:jmap:mail"]}async uploadBlob(accountId,body,fetchInit={}){var _a;let{uploadUrl}=await this.session,url=expandURITemplate(uploadUrl,{accountId});try{let response=await fetch(url,{method:"POST",headers:{Authorization:this.authHeader,Accept:"application/json"},body,...fetchInit});if(!response.ok)throw(_a=response.headers.get("Content-Type"))!=null&&_a.includes("json")?await response.json():await response.text();return await response.json()}catch(cause){throw new Error("Failed to upload blob",{cause})}}async downloadBlob(options,fetchInit={}){var _a;let{downloadUrl}=await this.session,params={accountId:options.accountId,blobId:options.blobId,type:options.mimeType,name:options.fileName},url=expandURITemplate(downloadUrl,params);try{let response=await fetch(url,{method:"GET",headers:{Authorization:this.authHeader},...fetchInit});if(!response.ok)throw(_a=response.headers.get("Content-Type"))!=null&&_a.includes("json")?await response.json():await response.text();return response}catch(cause){throw new Error("Failed to download blob",{cause})}}async connectEventSource(options){var _a;let params={types:options.types==="*"?"*":options.types.join(","),closeafter:(_a=options.closeafter)!=null?_a:"no",ping:`${options.ping}`},{eventSourceUrl}=await this.session,url=expandURITemplate(eventSourceUrl,params);return new EventSource(url)}get api(){return new Proxy({},{get:(_,entity)=>new Proxy({},{get:(__,operation)=>async(args,options)=>{let method=`${entity}/${operation}`;return this.request([method,args],options)}})})}static isProblemDetails(value){return typeof value=="object"&&value!==null&&"type"in value}};export{JamClient,JamClient as default};
//# sourceMappingURL=index.js.map