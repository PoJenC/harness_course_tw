import { DEVFRAME_OTP_URL_PARAM } from "./constants.mjs";
import { n as randomToken, r as timingSafeEqual, t as randomDigits } from "./crypto-token-TVbGGFuj.mjs";
//#region ../../node_modules/.pnpm/ua-parser-modern@0.1.1/node_modules/ua-parser-modern/dist/index.mjs
const EMPTY = "";
const UNKNOWN = "?";
const MAJOR = "major";
const MODEL = "model";
const NAME = "name";
const TYPE = "type";
const VENDOR = "vendor";
const VERSION = "version";
const ARCHITECTURE = "architecture";
const CONSOLE = "console";
const MOBILE = "mobile";
const TABLET = "tablet";
const SMARTTV = "smarttv";
const WEARABLE = "wearable";
const EMBEDDED = "embedded";
const UA_MAX_LENGTH = 500;
const AMAZON = "Amazon";
const APPLE = "Apple";
const ASUS = "ASUS";
const BLACKBERRY = "BlackBerry";
const BROWSER_LABEL = "Browser";
const CHROME = "Chrome";
const EDGE = "Edge";
const FIREFOX = "Firefox";
const GOOGLE = "Google";
const HUAWEI = "Huawei";
const LG = "LG";
const MICROSOFT = "Microsoft";
const MOTOROLA = "Motorola";
const OPERA = "Opera";
const SAMSUNG = "Samsung";
const SHARP = "Sharp";
const SONY = "Sony";
const XIAOMI = "Xiaomi";
const ZEBRA = "Zebra";
const FACEBOOK = "Facebook";
const CHROMIUM_OS = "Chromium OS";
const MAC_OS = "Mac OS";
function extend(regexes, extensions = {}) {
	const mergedRegexes = {};
	for (const key of Object.keys(regexes)) {
		const extension = extensions[key];
		if (extension && extension.length % 2 === 0) mergedRegexes[key] = [...extension, ...regexes[key]];
		else mergedRegexes[key] = regexes[key];
	}
	return mergedRegexes;
}
function enumerize(arr) {
	const enums = {};
	for (let i = 0; i < arr.length; i++) enums[arr[i].toUpperCase()] = arr[i];
	return enums;
}
function lowerize(str) {
	return str.toLowerCase();
}
function has(str1, str2) {
	return typeof str1 === "string" ? lowerize(str2).includes(lowerize(str1)) : false;
}
function majorize(version) {
	return typeof version === "string" ? version.replace(/[^\d.]/g, EMPTY).split(".")[0] : void 0;
}
function trim(str, len) {
	const result = str.replace(/^\s+/, EMPTY);
	return typeof len === "undefined" ? result : result.substring(0, len);
}
function rgxMapper(ua, arrays, augment) {
	const result = augment ?? {};
	for (let i = 0; i < arrays.length; i += 2) {
		const regex = arrays[i];
		const props = arrays[i + 1];
		for (let j = 0; j < regex.length; j++) {
			const matcher = regex[j];
			if (!matcher) break;
			const matches = matcher.exec(ua);
			if (!matches) continue;
			for (let p = 0; p < props.length; p++) {
				const match = matches[p + 1];
				const q = props[p];
				if (Array.isArray(q)) {
					const key = q[0];
					const length = q.length;
					if (length === 2) {
						const value = q[1];
						if (typeof value === "function") result[key] = value(match, void 0, result);
						else result[key] = value;
					} else if (length === 3) {
						const arg1 = q[1];
						const arg2 = q[2];
						if (typeof arg1 === "function" && !("exec" in arg1) && !("test" in arg1)) result[key] = match ? arg1(match, arg2, result) : void 0;
						else result[key] = match ? match.replace(arg1, arg2) : void 0;
					} else if (length === 4) result[key] = match ? q[3](match.replace(q[1], q[2]), void 0, result) : void 0;
				} else result[q] = match || void 0;
			}
			return result;
		}
	}
	return result;
}
function strMapper(str, map) {
	for (const i in map) {
		const value = map[i];
		if (Array.isArray(value) && value.length > 0) {
			for (let j = 0; j < value.length; j++) if (has(value[j], str)) return i === UNKNOWN ? void 0 : i;
		} else if (has(value, str)) return i === UNKNOWN ? void 0 : i;
	}
	return str;
}
const oldSafariMap = {
	"1.0": "/8",
	"1.2": "/1",
	"1.3": "/3",
	"2.0": "/412",
	"2.0.2": "/416",
	"2.0.3": "/417",
	"2.0.4": "/419",
	"?": "/"
};
const windowsVersionMap = {
	"ME": "4.90",
	"NT 3.11": "NT3.51",
	"NT 4.0": "NT4.0",
	"2000": "NT 5.0",
	"XP": ["NT 5.1", "NT 5.2"],
	"Vista": "NT 6.0",
	"7": "NT 6.1",
	"8": "NT 6.2",
	"8.1": "NT 6.3",
	"10": ["NT 6.4", "NT 10.0"],
	"RT": "ARM"
};
const regexes = {
	browser: [
		[/\b(?:crmo|crios)\/([\w.]+)/i],
		[VERSION, [NAME, "Chrome"]],
		[/edg(?:e|ios|a)?\/([\w.]+)/i],
		[VERSION, [NAME, "Edge"]],
		[
			/(opera mini)\/([-\w.]+)/i,
			/(opera [mobileta]{3,6})\b.+version\/([-\w.]+)/i,
			/(opera)(?:.+version\/|[/ ]+)([\w.]+)/i
		],
		[NAME, VERSION],
		[/opios[/ ]+([\w.]+)/i],
		[VERSION, [NAME, `${OPERA} Mini`]],
		[/\bop(?:rg)?x\/([\w.]+)/i],
		[VERSION, [NAME, `${OPERA} GX`]],
		[/\bopr\/([\w.]+)/i],
		[VERSION, [NAME, OPERA]],
		[/\bb[ai]*d(?:uhd|[ub]*[aekoprswx]{5,6})[/ ]?([\w.]+)/i],
		[VERSION, [NAME, "Baidu"]],
		[
			/(kindle)\/([\w.]+)/i,
			/(lunascape|maxthon|netfront|jasmine|blazer)[/ ]?([\w.]*)/i,
			/(avant|iemobile|slim)\s?(?:browser)?[/ ]?([\w.]*)/i,
			/(?:ms|\()(ie) ([\w.]+)/i,
			/(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w.]+)/i,
			/(heytap|ovi)browser\/([\d.]+)/i,
			/(weibo)__([\d.]+)/i
		],
		[NAME, VERSION],
		[/\bddg\/([\w.]+)/i],
		[VERSION, [NAME, "DuckDuckGo"]],
		[/(?:\buc? ?browser|juc.+ucweb)[/ ]?([\w.]+)/i],
		[VERSION, [NAME, `UC${BROWSER_LABEL}`]],
		[
			/microm.+\bqbcore\/([\w.]+)/i,
			/\bqbcore\/([\w.]+).+microm/i,
			/micromessenger\/([\w.]+)/i
		],
		[VERSION, [NAME, "WeChat"]],
		[/konqueror\/([\w.]+)/i],
		[VERSION, [NAME, "Konqueror"]],
		[/trident.+rv[: ]([\w.]{1,9})\b.+like gecko/i],
		[VERSION, [NAME, "IE"]],
		[/ya(?:search)?browser\/([\w.]+)/i],
		[VERSION, [NAME, "Yandex"]],
		[/slbrowser\/([\w.]+)/i],
		[VERSION, [NAME, `Smart Lenovo ${BROWSER_LABEL}`]],
		[/(avast|avg)\/([\w.]+)/i],
		[[
			NAME,
			/(.+)/,
			`$1 Secure ${BROWSER_LABEL}`
		], VERSION],
		[/\bfocus\/([\w.]+)/i],
		[VERSION, [NAME, `${FIREFOX} Focus`]],
		[/\bopt\/([\w.]+)/i],
		[VERSION, [NAME, `${OPERA} Touch`]],
		[/coc_coc\w+\/([\w.]+)/i],
		[VERSION, [NAME, "Coc Coc"]],
		[/dolfin\/([\w.]+)/i],
		[VERSION, [NAME, "Dolphin"]],
		[/coast\/([\w.]+)/i],
		[VERSION, [NAME, `${OPERA} Coast`]],
		[/miuibrowser\/([\w.]+)/i],
		[VERSION, [NAME, `MIUI ${BROWSER_LABEL}`]],
		[/fxios\/([-\w.]+)/i],
		[VERSION, [NAME, FIREFOX]],
		[/\bqihu|(qi?ho{0,2}|360)browser/i],
		[[NAME, `360 ${BROWSER_LABEL}`]],
		[/(oculus|sailfish|huawei|vivo)browser\/([\w.]+)/i],
		[[
			NAME,
			/(.+)/,
			`$1 ${BROWSER_LABEL}`
		], VERSION],
		[/samsungbrowser\/([\w.]+)/i],
		[VERSION, [NAME, `${SAMSUNG} Internet`]],
		[/(comodo_dragon)\/([\w.]+)/i],
		[[
			NAME,
			/_/g,
			" "
		], VERSION],
		[/metasr[/ ]?([\d.]+)/i],
		[VERSION, [NAME, "Sogou Explorer"]],
		[/(sogou)mo\w+\/([\d.]+)/i],
		[[NAME, "Sogou Mobile"], VERSION],
		[
			/(electron)\/([\w.]+) safari/i,
			/(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w.]+))/i,
			/m?(qqbrowser|2345Explorer)[/ ]?([\w.]+)/i
		],
		[NAME, VERSION],
		[/(lbbrowser)/i, /\[(linkedin)app\]/i],
		[NAME],
		[/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w.]+);)/i],
		[[NAME, FACEBOOK], VERSION],
		[
			/(Klarna)\/([\w.]+)/i,
			/(kakao(?:talk|story))[/ ]([\w.]+)/i,
			/(naver)\(.*?(\d+\.[\w.]+).*\)/i,
			/safari (line)\/([\w.]+)/i,
			/\b(line)\/([\w.]+)\/iab/i,
			/(alipay)client\/([\w.]+)/i,
			/(twitter)(?:and| f.+e\/([\w.]+))/i,
			/(chromium|instagram|snapchat)[/ ]([-\w.]+)/i
		],
		[NAME, VERSION],
		[/\bgsa\/([\w.]+) .*safari\//i],
		[VERSION, [NAME, "GSA"]],
		[/musical_ly(?:.+app_?version\/|_)([\w.]+)/i],
		[VERSION, [NAME, "TikTok"]],
		[/headlesschrome(?:\/([\w.]+)| )/i],
		[VERSION, [NAME, `${CHROME} Headless`]],
		[/ wv\).+(chrome)\/([\w.]+)/i],
		[[NAME, `${CHROME} WebView`], VERSION],
		[/droid.+ version\/([\w.]+)\b.+(?:mobile safari|safari)/i],
		[VERSION, [NAME, `Android ${BROWSER_LABEL}`]],
		[/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w.]+)/i],
		[NAME, VERSION],
		[/version\/([\w.,]+) .*mobile\/\w+ (safari)/i],
		[VERSION, [NAME, "Mobile Safari"]],
		[/version\/([\w(.|,)]+) .*(mobile ?safari|safari)/i],
		[VERSION, NAME],
		[/webkit.+?(mobile ?safari|safari)(\/[\w.]+)/i],
		[NAME, [
			VERSION,
			strMapper,
			oldSafariMap
		]],
		[/(webkit|khtml)\/([\w.]+)/i],
		[NAME, VERSION],
		[/(navigator|netscape\d?)\/([-\w.]+)/i],
		[[NAME, "Netscape"], VERSION],
		[/mobile vr; rv:([\w.]+)\).+firefox/i],
		[VERSION, [NAME, `${FIREFOX} Reality`]],
		[
			/ekiohf.+(flow)\/([\w.]+)/i,
			/(swiftfox)/i,
			/(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[/ ]?([\w.+]+)/i,
			/(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w.]+)$/i,
			/(firefox)\/([\w.]+)/i,
			/(mozilla)\/([\w.]+) .+rv:.+gecko\/\d+/i,
			/(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[. ]?browser)[-/ ]?v?([\w.]+)/i,
			/(links) \(([\w.]+)/i,
			/panasonic;(viera)/i
		],
		[NAME, VERSION],
		[/(cobalt)\/([\w.]+)/i],
		[NAME, [
			VERSION,
			/master.|lts./,
			""
		]]
	],
	cpu: [
		[/(amd|x(?:(?:86|64)[-_])?|wow|win)64[;)]/i],
		[[ARCHITECTURE, "amd64"]],
		[/(ia32(?=;))/i],
		[[ARCHITECTURE, lowerize]],
		[/((?:i[346]|x)86)[;)]/i],
		[[ARCHITECTURE, "ia32"]],
		[/\b(aarch64|arm(v?8e?l?|_?64))\b/i],
		[[ARCHITECTURE, "arm64"]],
		[/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i],
		[[ARCHITECTURE, "armhf"]],
		[/windows (ce|mobile); ppc;/i],
		[[ARCHITECTURE, "arm"]],
		[/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i],
		[[
			ARCHITECTURE,
			/ower/,
			EMPTY,
			lowerize
		]],
		[/(sun4\w)[;)]/i],
		[[ARCHITECTURE, "sparc"]],
		[/(avr32|ia64(?=;)|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i],
		[[ARCHITECTURE, lowerize]]
	],
	device: [
		[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i],
		[
			MODEL,
			[VENDOR, SAMSUNG],
			[TYPE, TABLET]
		],
		[
			/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?\d+a?|galaxy nexus)/i,
			/samsung[- ]([-\w]+)/i,
			/sec-(sgh\w+)/i
		],
		[
			MODEL,
			[VENDOR, SAMSUNG],
			[TYPE, MOBILE]
		],
		[/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i],
		[
			MODEL,
			[VENDOR, APPLE],
			[TYPE, MOBILE]
		],
		[
			/\((ipad);[-\w),; ]+apple/i,
			/applecoremedia\/[\w.]+ \((ipad)/i,
			/\b(ipad)\d\d?,\d\d?[;\]].+ios/i
		],
		[
			MODEL,
			[VENDOR, APPLE],
			[TYPE, TABLET]
		],
		[/(macintosh);/i],
		[MODEL, [VENDOR, APPLE]],
		[/\b(sh-?[altvz]?\d\d[a-ekm]?)/i],
		[
			MODEL,
			[VENDOR, SHARP],
			[TYPE, MOBILE]
		],
		[/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i],
		[
			MODEL,
			[VENDOR, HUAWEI],
			[TYPE, TABLET]
		],
		[/(?:huawei|honor)([-\w ]+)[;)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][0-359c][adn]?)\b(?!.+d\/s)/i],
		[
			MODEL,
			[VENDOR, HUAWEI],
			[TYPE, MOBILE]
		],
		[
			/\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,
			/\b; (\w+) build\/hm\1/i,
			/\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,
			/\b(redmi[\-_ ]?[\w ]+)(?: bui|\))/i,
			/oid[^)]+; (m?[12][0-389][01]\w{3,6}[c-y])( bui|; wv|\))/i,
			/\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?\d?\w?[_ ]?(?:plus|se|lite)?)(?: bui|\))/i
		],
		[
			[
				MODEL,
				/_/g,
				" "
			],
			[VENDOR, XIAOMI],
			[TYPE, MOBILE]
		],
		[/oid[^)]+; (2\d{4}(283|rpbf)[cgl])( bui|\))/i, /\b(mi[-_ ]?pad[\w ]+)(?: bui|\))/i],
		[
			[
				MODEL,
				/_/g,
				" "
			],
			[VENDOR, XIAOMI],
			[TYPE, TABLET]
		],
		[/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i],
		[
			MODEL,
			[VENDOR, "OPPO"],
			[TYPE, MOBILE]
		],
		[/\b(opd2\d{3}a?) bui/i],
		[
			MODEL,
			[VENDOR, "OPPO"],
			[TYPE, TABLET]
		],
		[/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i],
		[
			MODEL,
			[VENDOR, "Vivo"],
			[TYPE, MOBILE]
		],
		[/\b(rmx[1-3]\d{3})(?: bui|;|\))/i],
		[
			MODEL,
			[VENDOR, "Realme"],
			[TYPE, MOBILE]
		],
		[
			/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
			/\bmot(?:orola)?[- ](\w*)/i,
			/((?:moto[\w() ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i
		],
		[
			MODEL,
			[VENDOR, MOTOROLA],
			[TYPE, MOBILE]
		],
		[/\b(mz60\d|xoom[2 ]{0,2}) build\//i],
		[
			MODEL,
			[VENDOR, MOTOROLA],
			[TYPE, TABLET]
		],
		[/((?=lg)?[vl]k-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i],
		[
			MODEL,
			[VENDOR, LG],
			[TYPE, TABLET]
		],
		[
			/(lm(?:-?f100[nv]?|-[\w.]+)(?= bui|\))|nexus [45])/i,
			/\blg[-e;/ ]+((?!browser|netcast|android tv)\w+)/i,
			/\blg-?(\w+) bui/i
		],
		[
			MODEL,
			[VENDOR, LG],
			[TYPE, MOBILE]
		],
		[/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab[\w ]+|yt[-\w]{6}|tb[-\w]{6})/i],
		[
			MODEL,
			[VENDOR, "Lenovo"],
			[TYPE, TABLET]
		],
		[/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w.]*)/i],
		[
			[
				MODEL,
				/_/g,
				" "
			],
			[VENDOR, "Nokia"],
			[TYPE, MOBILE]
		],
		[/(pixel c)\b/i],
		[
			MODEL,
			[VENDOR, GOOGLE],
			[TYPE, TABLET]
		],
		[/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i],
		[
			MODEL,
			[VENDOR, GOOGLE],
			[TYPE, MOBILE]
		],
		[/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]?\d\.))/i],
		[
			MODEL,
			[VENDOR, SONY],
			[TYPE, MOBILE]
		],
		[/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i],
		[
			[MODEL, "Xperia Tablet"],
			[VENDOR, SONY],
			[TYPE, TABLET]
		],
		[/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i],
		[
			MODEL,
			[VENDOR, "OnePlus"],
			[TYPE, MOBILE]
		],
		[
			/(alexa)webm/i,
			/(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i,
			/(kf[a-z]+)( bui|\)).+silk\//i
		],
		[
			MODEL,
			[VENDOR, AMAZON],
			[TYPE, TABLET]
		],
		[/((?:sd|kf)[0349hijor-uw]+)( bui|\)).+silk\//i],
		[
			[
				MODEL,
				/(.+)/g,
				"Fire Phone $1"
			],
			[VENDOR, AMAZON],
			[TYPE, MOBILE]
		],
		[/(playbook);[-\w),; ]+(rim)/i],
		[
			MODEL,
			VENDOR,
			[TYPE, TABLET]
		],
		[/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i],
		[
			MODEL,
			[VENDOR, BLACKBERRY],
			[TYPE, MOBILE]
		],
		[/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i],
		[
			MODEL,
			[VENDOR, ASUS],
			[TYPE, TABLET]
		],
		[/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],
		[
			MODEL,
			[VENDOR, ASUS],
			[TYPE, MOBILE]
		],
		[/(nexus 9)/i],
		[
			MODEL,
			[VENDOR, "HTC"],
			[TYPE, TABLET]
		],
		[
			/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,
			/(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
			/(alcatel|geeksphone|nexian|panasonic(?!;|\.)|sony(?!-bra))[-_ ]?([-\w]*)/i
		],
		[
			VENDOR,
			[
				MODEL,
				/_/g,
				" "
			],
			[TYPE, MOBILE]
		],
		[/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i],
		[
			MODEL,
			[VENDOR, "Acer"],
			[TYPE, TABLET]
		],
		[/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i],
		[
			MODEL,
			[VENDOR, "Meizu"],
			[TYPE, MOBILE]
		],
		[/; ((?:power )?armor[\w ]{0,8})(?: bui|\))/i],
		[
			MODEL,
			[VENDOR, "Ulefone"],
			[TYPE, MOBILE]
		],
		[
			/(blackberry|benq|palm(?=-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno)[-_ ]?([-\w]*)/i,
			/(hp) ([\w ]+\w)/i,
			/(asus)-?(\w+)/i,
			/(microsoft); (lumia[\w ]+)/i,
			/(lenovo)[-_ ]?([-\w]+)/i,
			/(jolla)/i,
			/(oppo) ?([\w ]+) bui/i
		],
		[
			VENDOR,
			MODEL,
			[TYPE, MOBILE]
		],
		[
			/(kobo)\s(ereader|touch)/i,
			/(archos) (gamepad2?)/i,
			/(hp).+(touchpad(?!.+tablet)|tablet)/i,
			/(kindle)\/([\w.]+)/i,
			/(nook)[\w ]+build\/(\w+)/i,
			/(dell) (strea[kpr\d ]*[\dko])/i,
			/(le[- ]+pan)[- ]+(\w{1,9}) bui/i,
			/(trinity)[- ]*(t\d{3}) bui/i,
			/(gigaset)[- ]+(q\w{1,9}) bui/i,
			/(vodafone) ([\w ]+)(?:\)| bui)/i
		],
		[
			VENDOR,
			MODEL,
			[TYPE, TABLET]
		],
		[/(surface duo)/i],
		[
			MODEL,
			[VENDOR, MICROSOFT],
			[TYPE, TABLET]
		],
		[/droid [\d.]+; (fp\du?)(?: b|\))/i],
		[
			MODEL,
			[VENDOR, "Fairphone"],
			[TYPE, MOBILE]
		],
		[/(u304aa)/i],
		[
			MODEL,
			[VENDOR, "AT&T"],
			[TYPE, MOBILE]
		],
		[/\bsie-(\w*)/i],
		[
			MODEL,
			[VENDOR, "Siemens"],
			[TYPE, MOBILE]
		],
		[/\b(rct\w+) b/i],
		[
			MODEL,
			[VENDOR, "RCA"],
			[TYPE, TABLET]
		],
		[/\b(venue[\d ]{2,7}) b/i],
		[
			MODEL,
			[VENDOR, "Dell"],
			[TYPE, TABLET]
		],
		[/\b(q(?:mv|ta)\w+) b/i],
		[
			MODEL,
			[VENDOR, "Verizon"],
			[TYPE, TABLET]
		],
		[/\b(?:barnes[& ]+noble |bn[rt])([\w+ ]*) b/i],
		[
			MODEL,
			[VENDOR, "Barnes & Noble"],
			[TYPE, TABLET]
		],
		[/\b(tm\d{3}\w+) b/i],
		[
			MODEL,
			[VENDOR, "NuVision"],
			[TYPE, TABLET]
		],
		[/\b(k88) b/i],
		[
			MODEL,
			[VENDOR, "ZTE"],
			[TYPE, TABLET]
		],
		[/\b(nx\d{3}j) b/i],
		[
			MODEL,
			[VENDOR, "ZTE"],
			[TYPE, MOBILE]
		],
		[/\b(gen\d{3}) b.+49h/i],
		[
			MODEL,
			[VENDOR, "Swiss"],
			[TYPE, MOBILE]
		],
		[/\b(zur\d{3}) b/i],
		[
			MODEL,
			[VENDOR, "Swiss"],
			[TYPE, TABLET]
		],
		[/\b((zeki)?tb.*\b) b/i],
		[
			MODEL,
			[VENDOR, "Zeki"],
			[TYPE, TABLET]
		],
		[/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i],
		[
			[VENDOR, "Dragon Touch"],
			MODEL,
			[TYPE, TABLET]
		],
		[/\b(ns-?\w{0,9}) b/i],
		[
			MODEL,
			[VENDOR, "Insignia"],
			[TYPE, TABLET]
		],
		[/\b((nxa|next)-?\w{0,9}) b/i],
		[
			MODEL,
			[VENDOR, "NextBook"],
			[TYPE, TABLET]
		],
		[/\b(xtreme_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i],
		[
			[VENDOR, "Voice"],
			MODEL,
			[TYPE, MOBILE]
		],
		[/\b(lvtel-)?(v1[12]) b/i],
		[
			[VENDOR, "LvTel"],
			MODEL,
			[TYPE, MOBILE]
		],
		[/\b(ph-1) /i],
		[
			MODEL,
			[VENDOR, "Essential"],
			[TYPE, MOBILE]
		],
		[/\b(v(100md|700na|7011|917g).*\b) b/i],
		[
			MODEL,
			[VENDOR, "Envizen"],
			[TYPE, TABLET]
		],
		[/\b(trio[-\w. ]+) b/i],
		[
			MODEL,
			[VENDOR, "MachSpeed"],
			[TYPE, TABLET]
		],
		[/\btu_(1491) b/i],
		[
			MODEL,
			[VENDOR, "Rotor"],
			[TYPE, TABLET]
		],
		[/(shield[\w ]+) b/i],
		[
			MODEL,
			[VENDOR, "Nvidia"],
			[TYPE, TABLET]
		],
		[/(sprint) (\w+)/i],
		[
			VENDOR,
			MODEL,
			[TYPE, MOBILE]
		],
		[/(kin\.[onetw]{3})/i],
		[
			[
				MODEL,
				/\./g,
				" "
			],
			[VENDOR, MICROSOFT],
			[TYPE, MOBILE]
		],
		[/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i],
		[
			MODEL,
			[VENDOR, ZEBRA],
			[TYPE, TABLET]
		],
		[/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],
		[
			MODEL,
			[VENDOR, ZEBRA],
			[TYPE, MOBILE]
		],
		[/smart-tv.+(samsung)/i],
		[VENDOR, [TYPE, SMARTTV]],
		[/hbbtv.+maple;(\d+)/i],
		[
			[
				MODEL,
				/^/,
				"SmartTV"
			],
			[VENDOR, SAMSUNG],
			[TYPE, SMARTTV]
		],
		[/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i],
		[[VENDOR, LG], [TYPE, SMARTTV]],
		[/(apple) ?tv/i],
		[
			VENDOR,
			[MODEL, `${APPLE} TV`],
			[TYPE, SMARTTV]
		],
		[/crkey/i],
		[
			[MODEL, `${CHROME}cast`],
			[VENDOR, GOOGLE],
			[TYPE, SMARTTV]
		],
		[/droid.+aft(\w+)( bui|\))/i],
		[
			MODEL,
			[VENDOR, AMAZON],
			[TYPE, SMARTTV]
		],
		[/\(dtv[);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i],
		[
			MODEL,
			[VENDOR, SHARP],
			[TYPE, SMARTTV]
		],
		[/(bravia[\w ]+)( bui|\))/i],
		[
			MODEL,
			[VENDOR, SONY],
			[TYPE, SMARTTV]
		],
		[/(mitv-\w{5}) bui/i],
		[
			MODEL,
			[VENDOR, XIAOMI],
			[TYPE, SMARTTV]
		],
		[/Hbbtv.*(technisat) (.*);/i],
		[
			VENDOR,
			MODEL,
			[TYPE, SMARTTV]
		],
		[/\b(roku)[\dx]*[)/]((?:dvp-)?[\d.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w+ ]*; *(\w[^;]*);([^;]*)/i],
		[
			[VENDOR, trim],
			[MODEL, trim],
			[TYPE, SMARTTV]
		],
		[/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i],
		[[TYPE, SMARTTV]],
		[/(ouya)/i, /(nintendo) ([wids3utch]+)/i],
		[
			VENDOR,
			MODEL,
			[TYPE, CONSOLE]
		],
		[/droid.+; (shield) bui/i],
		[
			MODEL,
			[VENDOR, "Nvidia"],
			[TYPE, CONSOLE]
		],
		[/(playstation [345portablevi]+)/i],
		[
			MODEL,
			[VENDOR, SONY],
			[TYPE, CONSOLE]
		],
		[/\b(xbox(?: one)?(?!; xbox))[); ]/i],
		[
			MODEL,
			[VENDOR, MICROSOFT],
			[TYPE, CONSOLE]
		],
		[/((pebble))app/i],
		[
			VENDOR,
			MODEL,
			[TYPE, WEARABLE]
		],
		[/(watch)(?: ?os[,/]|\d,\d\/)[\d.]+/i],
		[
			MODEL,
			[VENDOR, APPLE],
			[TYPE, WEARABLE]
		],
		[/droid.+; (glass) \d/i],
		[
			MODEL,
			[VENDOR, GOOGLE],
			[TYPE, WEARABLE]
		],
		[/droid.+; (wt63?0{2,3})\)/i],
		[
			MODEL,
			[VENDOR, ZEBRA],
			[TYPE, WEARABLE]
		],
		[/(quest( \d| pro)?)/i],
		[
			MODEL,
			[VENDOR, FACEBOOK],
			[TYPE, WEARABLE]
		],
		[/(tesla)(?: qtcarbrowser|\/[-\w.]+)/i],
		[VENDOR, [TYPE, EMBEDDED]],
		[/(aeobc)\b/i],
		[
			MODEL,
			[VENDOR, AMAZON],
			[TYPE, EMBEDDED]
		],
		[/droid .+?; ([^;]+?)(?: bui|; wv\)|\) applew).+? mobile safari/i],
		[MODEL, [TYPE, MOBILE]],
		[/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i],
		[MODEL, [TYPE, TABLET]],
		[/\b((tablet|tab)[;/]|focus\/\d(?!.+mobile))/i],
		[[TYPE, TABLET]],
		[/(phone|mobile(?:[;/]| [ \w/.]*safari)|pda(?=.+windows ce))/i],
		[[TYPE, MOBILE]],
		[/(android[-\w. ]{0,9});.+buil/i],
		[MODEL, [VENDOR, "Generic"]]
	],
	engine: [
		[/windows.+ edge\/([\w.]+)/i],
		[VERSION, [NAME, `${EDGE}HTML`]],
		[/webkit\/537\.36.+chrome\/(?!27)([\w.]+)/i],
		[VERSION, [NAME, "Blink"]],
		[
			/(presto)\/([\w.]+)/i,
			/(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w.]+)/i,
			/ekioh(flow)\/([\w.]+)/i,
			/(khtml|tasman|links)[/ ]\(?([\w.]+)/i,
			/(icab)[/ ]([23]\.[\d.]+)/i,
			/\b(libweb)/i
		],
		[NAME, VERSION],
		[/rv:([\w.]{1,9})\b.+(gecko)/i],
		[VERSION, NAME]
	],
	os: [
		[/microsoft (windows) (vista|xp)/i],
		[NAME, VERSION],
		[/(windows (?:phone(?: os)?|mobile))[/ ]?([.\w ]*)/i],
		[NAME, [
			VERSION,
			strMapper,
			windowsVersionMap
		]],
		[
			/windows nt 6\.2; (arm)/i,
			/windows[/ ]?([ntce\d. ]+\w)(?!.+xbox)/i,
			/(?:win(?=[39n])|win 9x )([nt\d.]+)/i
		],
		[[
			VERSION,
			strMapper,
			windowsVersionMap
		], [NAME, "Windows"]],
		[
			/ip[honead]{2,4}\b(?:.*os (\w+) like mac|; opera)/i,
			/(?:ios;fbsv\/|iphone.+ios[/ ])([\d.]+)/i,
			/cfnetwork\/.+darwin/i
		],
		[[
			VERSION,
			/_/g,
			"."
		], [NAME, "iOS"]],
		[/(mac os x) ?([\w. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i],
		[[NAME, MAC_OS], [
			VERSION,
			/_/g,
			"."
		]],
		[/droid ([\w.]+)\b.+(android[- ]x86|harmonyos)/i],
		[VERSION, NAME],
		[
			/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-/ ]?([\w.]*)/i,
			/(blackberry)\w*\/([\w.]*)/i,
			/(tizen|kaios)[/ ]([\w.]+)/i,
			/\((series40);/i
		],
		[NAME, VERSION],
		[/\(bb(10);/i],
		[VERSION, [NAME, BLACKBERRY]],
		[/(?:symbian ?os|symbos|s60(?=;)|series60)[-/ ]?([\w.]*)/i],
		[VERSION, [NAME, "Symbian"]],
		[/mozilla\/[\d.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w.]+)/i],
		[VERSION, [NAME, `${FIREFOX} OS`]],
		[/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w.]+)/i],
		[VERSION, [NAME, "webOS"]],
		[/watch(?: ?os[,/]|\d,\d\/)([\d.]+)/i],
		[VERSION, [NAME, "watchOS"]],
		[/crkey\/([\d.]+)/i],
		[VERSION, [NAME, `${CHROME}cast`]],
		[/(cros) \w+(?:\)| ([\w.]+)\b)/i],
		[[NAME, CHROMIUM_OS], VERSION],
		[
			/panasonic;(viera)/i,
			/(netrange)mmh/i,
			/(nettv)\/(\d+\.[\w.]+)/i,
			/(nintendo|playstation) ([wids345portablevuch]+)/i,
			/(xbox); +xbox ([^);]+)/i,
			/\b(joli|palm)\b ?(?:os)?\/?([\w.]*)/i,
			/(mint)[/() ]?(\w*)/i,
			/(mageia|vectorlinux)[; ]/i,
			/([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-/ ]?(?!chrom|package)([-\w.]*)/i,
			/(hurd|linux) ?([\w.]*)/i,
			/(gnu) ?([\w.]*)/i,
			/\b([-e-hrntopcs]{0,5}bsd|dragonfly)[/ ]?(?!amd|[ix346]{1,2}86)([\w.]*)/i,
			/(haiku) (\w+)/i
		],
		[NAME, VERSION],
		[/(sunos) ?([\w.]*)/i],
		[[NAME, "Solaris"], VERSION],
		[
			/((?:open)?solaris)[-/ ]?([\w.]*)/i,
			/(aix) ((\d)(?=[.) ])[\w.])*/i,
			/\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,
			/(unix) ?([\w.]*)/i
		],
		[NAME, VERSION]
	]
};
function isExtensionsInput(input) {
	return typeof input === "object" && input !== null;
}
Object.freeze(enumerize([
	NAME,
	VERSION,
	MAJOR
]));
Object.freeze(enumerize([ARCHITECTURE]));
Object.freeze(enumerize([
	MODEL,
	VENDOR,
	TYPE,
	CONSOLE,
	MOBILE,
	SMARTTV,
	TABLET,
	WEARABLE,
	EMBEDDED
]));
Object.freeze(enumerize([NAME, VERSION]));
Object.freeze(enumerize([NAME, VERSION]));
function getRuntimeNavigator() {
	if (typeof window === "undefined" || !window.navigator) return void 0;
	return window.navigator;
}
function normalizeUA(ua) {
	return ua.length > UA_MAX_LENGTH ? trim(ua, UA_MAX_LENGTH) : ua;
}
function createDefaultParserContext(uastring) {
	if (typeof uastring === "string") return {
		ua: normalizeUA(uastring),
		isSelfNavigator: false,
		navigator: void 0,
		userAgentData: void 0,
		regexMap: regexes
	};
	const navigator = getRuntimeNavigator();
	const ua = normalizeUA(navigator && navigator.userAgent ? navigator.userAgent : EMPTY);
	return {
		ua,
		isSelfNavigator: Boolean(navigator && navigator.userAgent === ua),
		navigator,
		userAgentData: navigator?.userAgentData,
		regexMap: regexes
	};
}
function createParserContext(uastringOrExtensions, extensions) {
	if (!extensions && !isExtensionsInput(uastringOrExtensions)) return createDefaultParserContext(uastringOrExtensions);
	const navigator = getRuntimeNavigator();
	const uastring = isExtensionsInput(uastringOrExtensions) ? void 0 : uastringOrExtensions;
	const resolvedExtensions = isExtensionsInput(uastringOrExtensions) ? uastringOrExtensions : extensions;
	const ua = normalizeUA(uastring || (navigator && navigator.userAgent ? navigator.userAgent : EMPTY));
	const userAgentData = navigator?.userAgentData;
	return {
		ua,
		isSelfNavigator: Boolean(navigator && navigator.userAgent === ua),
		navigator,
		userAgentData,
		regexMap: resolvedExtensions ? extend(regexes, resolvedExtensions) : regexes
	};
}
function parseBrowserFromContext(context) {
	const browser = {
		name: void 0,
		version: void 0,
		major: void 0
	};
	rgxMapper(context.ua, context.regexMap.browser, browser);
	browser.major = majorize(browser.version);
	if (context.isSelfNavigator && context.navigator?.brave && typeof context.navigator.brave.isBrave === "function") browser.name = "Brave";
	return browser;
}
function parseCPUFromContext(context) {
	const cpu = { architecture: void 0 };
	rgxMapper(context.ua, context.regexMap.cpu, cpu);
	return cpu;
}
function parseDeviceFromContext(context) {
	const device = {
		vendor: void 0,
		model: void 0,
		type: void 0
	};
	rgxMapper(context.ua, context.regexMap.device, device);
	if (context.isSelfNavigator && !device.type && context.userAgentData?.mobile) device.type = MOBILE;
	if (context.isSelfNavigator && device.model === "Macintosh" && context.navigator && typeof context.navigator.standalone !== "undefined" && context.navigator.maxTouchPoints && context.navigator.maxTouchPoints > 2) {
		device.model = "iPad";
		device.type = TABLET;
	}
	return device;
}
function parseEngineFromContext(context) {
	const engine = {
		name: void 0,
		version: void 0
	};
	rgxMapper(context.ua, context.regexMap.engine, engine);
	return engine;
}
function parseOSFromContext(context) {
	const os = {
		name: void 0,
		version: void 0
	};
	rgxMapper(context.ua, context.regexMap.os, os);
	if (context.isSelfNavigator && !os.name && context.userAgentData?.platform && context.userAgentData.platform !== "Unknown") os.name = context.userAgentData.platform.replace(/chrome os/i, CHROMIUM_OS).replace(/macos/i, MAC_OS);
	return os;
}
function parseUA(uastringOrExtensions, extensions) {
	let context;
	let browserCache;
	let engineCache;
	let osCache;
	let deviceCache;
	let cpuCache;
	const getContext = () => context ||= createParserContext(uastringOrExtensions, extensions);
	return {
		get ua() {
			return getContext().ua;
		},
		get browser() {
			browserCache ||= parseBrowserFromContext(getContext());
			return browserCache;
		},
		get engine() {
			engineCache ||= parseEngineFromContext(getContext());
			return engineCache;
		},
		get os() {
			osCache ||= parseOSFromContext(getContext());
			return osCache;
		},
		get device() {
			deviceCache ||= parseDeviceFromContext(getContext());
			return deviceCache;
		},
		get cpu() {
			cpuCache ||= parseCPUFromContext(getContext());
			return cpuCache;
		}
	};
}
//#endregion
//#region src/node/auth/state.ts
/**
* Format a raw `navigator.userAgent` string into the short display label
* shown for a trusted device (e.g. "Chrome 120 | macOS 14 desktop").
*
* The client used to parse+format this itself, but that pulled
* `ua-parser-modern` into the browser bundle for a label nothing else on
* the client needs; the client now sends the raw string and parsing
* happens here, at the server ingress, keeping the persisted label format
* identical.
*/
function describeUA(userAgent) {
	const info = parseUA(userAgent);
	return [
		info.browser.name,
		info.browser.version,
		"|",
		info.os.name,
		info.os.version,
		info.device.type
	].filter((i) => i).join(" ");
}
/** Number of decimal digits in a human-typed one-time authentication code. */
const TEMP_AUTH_CODE_LENGTH = 6;
/**
* How long an authentication code stays valid after it is (re)generated. A
* 6-digit code only has ~20 bits of entropy, so a short lifetime plus the
* attempt cap below are what keep it brute-force resistant.
*/
const TEMP_AUTH_CODE_TTL = 3e5;
/** Failed attempts allowed against a single code before it is rotated. */
const TEMP_AUTH_MAX_ATTEMPTS = 5;
let tempAuthCode;
let tempAuthCodeExpiresAt = 0;
let tempAuthFailedAttempts = 0;
function generateTempCode() {
	return randomDigits(TEMP_AUTH_CODE_LENGTH);
}
function ensureTempAuthCode() {
	if (tempAuthCode === void 0) {
		tempAuthCode = generateTempCode();
		tempAuthCodeExpiresAt = Date.now() + TEMP_AUTH_CODE_TTL;
	}
	return tempAuthCode;
}
/**
* The current one-time authentication code. Display this to the user (e.g. in
* the dev-server terminal) so they can type it into the browser to authenticate.
*/
function getTempAuthCode() {
	return ensureTempAuthCode();
}
/**
* The current code plus its expiry timestamp, for display (e.g. the auth
* banner). An already-expired code is rotated first, so the returned code is
* always redeemable for its remaining lifetime.
*/
function getTempAuthCodeInfo() {
	ensureTempAuthCode();
	if (Date.now() > tempAuthCodeExpiresAt) refreshTempAuthCode();
	return {
		code: tempAuthCode,
		expireAt: tempAuthCodeExpiresAt
	};
}
/**
* Rotate the authentication code, resetting its expiry window and failed-attempt
* counter. Call this when a new authentication flow begins (e.g. when an
* untrusted client starts authenticating) so the displayed code is freshly
* valid for its full TTL.
*/
function refreshTempAuthCode() {
	tempAuthCode = generateTempCode();
	tempAuthCodeExpiresAt = Date.now() + TEMP_AUTH_CODE_TTL;
	tempAuthFailedAttempts = 0;
	return tempAuthCode;
}
/**
* Build a "magic link" authentication URL that embeds a one-time code (OTP) in
* the URL **fragment**. Opening it authenticates the client without typing;
* print it on startup (devframe stays headless, so the host prints its own
* banner). Defaults to the current code; the link is subject to the same TTL.
*
* The code rides the fragment (`#devframe_otp=…`), not the query string, so it
* is never sent to the server, written to an access log, or leaked in a
* `Referer` header; the browser client reads it locally (see
* `consumeOtpFromUrl`). Any existing fragment parameters are preserved.
*/
function buildOtpAuthUrl(baseUrl, code = getTempAuthCode()) {
	const url = new URL(baseUrl);
	const fragment = new URLSearchParams(url.hash.replace(/^#/, ""));
	fragment.set(DEVFRAME_OTP_URL_PARAM, code);
	url.hash = fragment.toString();
	return url.href;
}
/**
* Re-authenticate a connection that presents a previously-issued bearer token.
* Returns `true` and marks the session trusted when the token is known.
*
* Used by the `anonymous:devframe:auth` handler so a client that already
* authenticated (token persisted in the browser) is trusted on reconnect
* without entering the code again.
*/
function verifyAuthToken(token, session, storage) {
	if (!token || !storage.value().trusted[token]) return false;
	session.meta.clientAuthToken = token;
	session.meta.isTrusted = true;
	return true;
}
/**
* Exchange a one-time authentication code for a fresh, node-issued bearer token.
*
* On success this mints a high-entropy token, records it in the trusted store,
* marks the calling session trusted, rotates the code, and returns the token
* for the client to persist. Returns `null` on any failure.
*
* Because the code is short and human-typed, verification is hardened against
* brute force: it enforces a time-to-live, compares in constant time, and
* rotates the code after {@link TEMP_AUTH_MAX_ATTEMPTS} failed attempts so an
* attacker cannot keep guessing against the same code.
*/
function exchangeTempAuthCode(code, session, info, storage) {
	const currentTempAuthCode = ensureTempAuthCode();
	if (Date.now() > tempAuthCodeExpiresAt) {
		refreshTempAuthCode();
		return null;
	}
	if (!timingSafeEqual(code, currentTempAuthCode)) {
		tempAuthFailedAttempts += 1;
		if (tempAuthFailedAttempts >= TEMP_AUTH_MAX_ATTEMPTS) refreshTempAuthCode();
		return null;
	}
	const authToken = randomToken();
	storage.mutate((state) => {
		state.trusted[authToken] = {
			authToken,
			ua: describeUA(info.ua),
			origin: info.origin,
			timestamp: Date.now()
		};
	});
	session.meta.clientAuthToken = authToken;
	session.meta.isTrusted = true;
	refreshTempAuthCode();
	return authToken;
}
//#endregion
export { getTempAuthCodeInfo as a, getTempAuthCode as i, describeUA as n, refreshTempAuthCode as o, exchangeTempAuthCode as r, verifyAuthToken as s, buildOtpAuthUrl as t };
