//#region src/adapters/embedded.ts
/**
* Register a devframe into an already-running devframe/Kit context at
* runtime. Mirrors what the Vite plugin scan does for devframes passed
* as plugin options, but exposes the same flow to callers that need
* dynamic, post-startup registration.
*
* The host owns the mount path; when a hosted mount is needed the
* effective default follows the hosted rule of `def.basePath ?? '/__<id>/'`.
*/
async function createEmbedded(d, options) {
	for (const input of d.services ?? []) options.ctx.services.install(input, { resolveFrom: d.importMetaUrl });
	await options.ctx.services.ready();
	await d.setup(options.ctx);
}
//#endregion
export { createEmbedded };
