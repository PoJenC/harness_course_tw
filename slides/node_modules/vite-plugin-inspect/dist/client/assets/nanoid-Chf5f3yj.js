//#region node_modules/.pnpm/devframe@1.2.3_@devframes+agentic@1.2.3_cac@7.0.0_srvx@1.0.5/node_modules/devframe/dist/utils/nanoid.mjs
var urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
function nanoid(size = 21) {
	let id = "";
	let i = size;
	while (i--) id += urlAlphabet[Math.random() * 64 | 0];
	return id;
}
//#endregion
export { nanoid as t };
