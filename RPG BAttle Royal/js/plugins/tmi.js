/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 133:
/***/ ((module, exports, __nccwpck_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Stream = _interopDefault(__nccwpck_require__(413));
var http = _interopDefault(__nccwpck_require__(605));
var Url = _interopDefault(__nccwpck_require__(835));
var https = _interopDefault(__nccwpck_require__(211));
var zlib = _interopDefault(__nccwpck_require__(761));

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = __nccwpck_require__(522).convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
		if (!res) {
			res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
			if (res) {
				res.pop(); // drop last quote
			}
		}

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout,
							size: request.size
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

module.exports = exports = fetch;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.default = exports;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.FetchError = FetchError;


/***/ }),

/***/ 900:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const client = __nccwpck_require__(997);
module.exports = {
	client,
	Client: client
};


/***/ }),

/***/ 781:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const fetch = __nccwpck_require__(133);
const _ = __nccwpck_require__(658);

module.exports = function api(options, callback) {
	// Set the url to options.uri or options.url..
	let url = options.url !== undefined ? options.url : options.uri;

	// Make sure it is a valid url..
	if(!_.isURL(url)) {
		url = `https://api.twitch.tv/kraken${url[0] === '/' ? url : `/${url}`}`;
	}

	// We are inside a Node application, so we can use the node-fetch module..
	if(_.isNode()) {
		const opts = Object.assign({ method: 'GET', json: true }, options);
		if(opts.qs) {
			const qs = new URLSearchParams(opts.qs);
			url += `?${qs}`;
		}
		let response = {};
		/** @type {ReturnType<import('node-fetch')['default']>} */
		const fetchPromise = fetch(url, {
			method: opts.method,
			headers: opts.headers,
			body: opts.body
		});
		fetchPromise.then(res => {
			response = { statusCode: res.status, headers: res.headers };
			return opts.json ? res.json() : res.text();
		})
		.then(
			data => callback(null, response, data),
			err => callback(err, response, null)
		);
	}
	// Web application, extension, React Native etc.
	else {
		const opts = Object.assign({ method: 'GET', headers: {} }, options, { url });
		// prepare request
		const xhr = new XMLHttpRequest();
		xhr.open(opts.method, opts.url, true);
		for(const name in opts.headers) {
			xhr.setRequestHeader(name, opts.headers[name]);
		}
		xhr.responseType = 'json';
		// set request handler
		xhr.addEventListener('load', _ev => {
			if(xhr.readyState === 4) {
				if(xhr.status !== 200) {
					callback(xhr.status, null, null);
				}
				else {
					callback(null, null, xhr.response);
				}
			}
		});
		// submit
		xhr.send();
	}
};


/***/ }),

/***/ 997:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const _global = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : {};
const _WebSocket = _global.WebSocket || __nccwpck_require__(713);
const _fetch = _global.fetch || __nccwpck_require__(133);
const api = __nccwpck_require__(781);
const commands = __nccwpck_require__(169);
const EventEmitter = __nccwpck_require__(687).EventEmitter;
const logger = __nccwpck_require__(295);
const parse = __nccwpck_require__(668);
const Queue = __nccwpck_require__(569);
const _ = __nccwpck_require__(658);

let _apiWarned = false;

// Client instance..
const client = function client(opts) {
	if(this instanceof client === false) { return new client(opts); }
	this.opts = _.get(opts, {});
	this.opts.channels = this.opts.channels || [];
	this.opts.connection = this.opts.connection || {};
	this.opts.identity = this.opts.identity || {};
	this.opts.options = this.opts.options || {};

	this.clientId = _.get(this.opts.options.clientId, null);
	this._globalDefaultChannel = _.channel(_.get(this.opts.options.globalDefaultChannel, '#tmijs'));
	this._skipMembership = _.get(this.opts.options.skipMembership, false);
	this._skipUpdatingEmotesets = _.get(this.opts.options.skipUpdatingEmotesets, false);
	this._updateEmotesetsTimer = null;
	this._updateEmotesetsTimerDelay = _.get(this.opts.options.updateEmotesetsTimer, 60000);

	this.maxReconnectAttempts = _.get(this.opts.connection.maxReconnectAttempts, Infinity);
	this.maxReconnectInterval = _.get(this.opts.connection.maxReconnectInterval, 30000);
	this.reconnect = _.get(this.opts.connection.reconnect, true);
	this.reconnectDecay = _.get(this.opts.connection.reconnectDecay, 1.5);
	this.reconnectInterval = _.get(this.opts.connection.reconnectInterval, 1000);

	this.reconnecting = false;
	this.reconnections = 0;
	this.reconnectTimer = this.reconnectInterval;

	this.secure = _.get(
		this.opts.connection.secure,
		!this.opts.connection.server && !this.opts.connection.port
	);

	// Raw data and object for emote-sets..
	this.emotes = '';
	this.emotesets = {};

	this.channels = [];
	this.currentLatency = 0;
	this.globaluserstate = {};
	this.lastJoined = '';
	this.latency = new Date();
	this.moderators = {};
	this.pingLoop = null;
	this.pingTimeout = null;
	this.reason = '';
	this.username = '';
	this.userstate = {};
	this.wasCloseCalled = false;
	this.ws = null;

	// Create the logger..
	let level = 'error';
	if(this.opts.options.debug) { level = 'info'; }
	this.log = this.opts.logger || logger;

	try { logger.setLevel(level); } catch(err) {}

	// Format the channel names..
	this.opts.channels.forEach((part, index, theArray) =>
		theArray[index] = _.channel(part)
	);

	EventEmitter.call(this);
	this.setMaxListeners(0);
};

_.inherits(client, EventEmitter);

// Put all commands in prototype..
for(const methodName in commands) {
	client.prototype[methodName] = commands[methodName];
}

// Emit multiple events..
client.prototype.emits = function emits(types, values) {
	for(let i = 0; i < types.length; i++) {
		const val = i < values.length ? values[i] : values[values.length - 1];
		this.emit.apply(this, [ types[i] ].concat(val));
	}
};
/** @deprecated */
client.prototype.api = function(...args) {
	if(!_apiWarned) {
		this.log.warn('Client.prototype.api is deprecated and will be removed for version 2.0.0');
		_apiWarned = true;
	}
	api(...args);
};
// Handle parsed chat server message..
client.prototype.handleMessage = function handleMessage(message) {
	if(!message) {
		return;
	}

	if(this.listenerCount('raw_message')) {
		this.emit('raw_message', JSON.parse(JSON.stringify(message)), message);
	}

	const channel = _.channel(_.get(message.params[0], null));
	let msg = _.get(message.params[1], null);
	const msgid = _.get(message.tags['msg-id'], null);

	// Parse badges, badge-info and emotes..
	const tags = message.tags = parse.badges(parse.badgeInfo(parse.emotes(message.tags)));

	// Transform IRCv3 tags..
	for(const key in tags) {
		if(key === 'emote-sets' || key === 'ban-duration' || key === 'bits') {
			continue;
		}
		let value = tags[key];
		if(typeof value === 'boolean') { value = null; }
		else if(value === '1') { value = true; }
		else if(value === '0') { value = false; }
		else if(typeof value === 'string') { value = _.unescapeIRC(value); }
		tags[key] = value;
	}

	// Messages with no prefix..
	if(message.prefix === null) {
		switch(message.command) {
			// Received PING from server..
			case 'PING':
				this.emit('ping');
				if(this._isConnected()) {
					this.ws.send('PONG');
				}
				break;

			// Received PONG from server, return current latency..
			case 'PONG': {
				const currDate = new Date();
				this.currentLatency = (currDate.getTime() - this.latency.getTime()) / 1000;
				this.emits([ 'pong', '_promisePing' ], [ [ this.currentLatency ] ]);

				clearTimeout(this.pingTimeout);
				break;
			}

			default:
				this.log.warn(`Could not parse message with no prefix:\n${JSON.stringify(message, null, 4)}`);
				break;
		}
	}


	// Messages with "tmi.twitch.tv" as a prefix..
	else if(message.prefix === 'tmi.twitch.tv') {
		switch(message.command) {
			case '002':
			case '003':
			case '004':
			case '372':
			case '375':
			case 'CAP':
				break;

			// Retrieve username from server..
			case '001':
				this.username = message.params[0];
				break;

			// Connected to server..
			case '376': {
				this.log.info('Connected to server.');
				this.userstate[this._globalDefaultChannel] = {};
				this.emits([ 'connected', '_promiseConnect' ], [ [ this.server, this.port ], [ null ] ]);
				this.reconnections = 0;
				this.reconnectTimer = this.reconnectInterval;

				// Set an internal ping timeout check interval..
				this.pingLoop = setInterval(() => {
					// Make sure the connection is opened before sending the message..
					if(this._isConnected()) {
						this.ws.send('PING');
					}
					this.latency = new Date();
					this.pingTimeout = setTimeout(() => {
						if(this.ws !== null) {
							this.wasCloseCalled = false;
							this.log.error('Ping timeout.');
							this.ws.close();

							clearInterval(this.pingLoop);
							clearTimeout(this.pingTimeout);
						}
					}, _.get(this.opts.connection.timeout, 9999));
				}, 60000);

				// Join all the channels from the config with an interval..
				let joinInterval = _.get(this.opts.options.joinInterval, 2000);
				if(joinInterval < 300) {
					joinInterval = 300;
				}
				const joinQueue = new Queue(joinInterval);
				const joinChannels = _.union(this.opts.channels, this.channels);
				this.channels = [];

				for(let i = 0; i < joinChannels.length; i++) {
					const channel = joinChannels[i];
					joinQueue.add(() => {
						if(this._isConnected()) {
							this.join(channel).catch(err => this.log.error(err));
						}
					});
				}

				joinQueue.next();
				break;
			}

			// https://github.com/justintv/Twitch-API/blob/master/chat/capabilities.md#notice
			case 'NOTICE': {
				const nullArr = [ null ];
				const noticeArr = [ channel, msgid, msg ];
				const msgidArr = [ msgid ];
				const channelTrueArr = [ channel, true ];
				const channelFalseArr = [ channel, false ];
				const noticeAndNull = [ noticeArr, nullArr ];
				const noticeAndMsgid = [ noticeArr, msgidArr ];
				const basicLog = `[${channel}] ${msg}`;
				switch(msgid) {
					// This room is now in subscribers-only mode.
					case 'subs_on':
						this.log.info(`[${channel}] This room is now in subscribers-only mode.`);
						this.emits([ 'subscriber', 'subscribers', '_promiseSubscribers' ], [ channelTrueArr, channelTrueArr, nullArr ]);
						break;

					// This room is no longer in subscribers-only mode.
					case 'subs_off':
						this.log.info(`[${channel}] This room is no longer in subscribers-only mode.`);
						this.emits([ 'subscriber', 'subscribers', '_promiseSubscribersoff' ], [ channelFalseArr, channelFalseArr, nullArr ]);
						break;

					// This room is now in emote-only mode.
					case 'emote_only_on':
						this.log.info(`[${channel}] This room is now in emote-only mode.`);
						this.emits([ 'emoteonly', '_promiseEmoteonly' ], [ channelTrueArr, nullArr ]);
						break;

					// This room is no longer in emote-only mode.
					case 'emote_only_off':
						this.log.info(`[${channel}] This room is no longer in emote-only mode.`);
						this.emits([ 'emoteonly', '_promiseEmoteonlyoff' ], [ channelFalseArr, nullArr ]);
						break;

					// Do not handle slow_on/off here, listen to the ROOMSTATE notice instead as it returns the delay.
					case 'slow_on':
					case 'slow_off':
						break;

					// Do not handle followers_on/off here, listen to the ROOMSTATE notice instead as it returns the delay.
					case 'followers_on_zero':
					case 'followers_on':
					case 'followers_off':
						break;

					// This room is now in r9k mode.
					case 'r9k_on':
						this.log.info(`[${channel}] This room is now in r9k mode.`);
						this.emits([ 'r9kmode', 'r9kbeta', '_promiseR9kbeta' ], [ channelTrueArr, channelTrueArr, nullArr ]);
						break;

					// This room is no longer in r9k mode.
					case 'r9k_off':
						this.log.info(`[${channel}] This room is no longer in r9k mode.`);
						this.emits([ 'r9kmode', 'r9kbeta', '_promiseR9kbetaoff' ], [ channelFalseArr, channelFalseArr, nullArr ]);
						break;

					// The moderators of this room are: [..., ...]
					case 'room_mods': {
						const mods = msg.split(': ')[1].toLowerCase()
						.split(', ')
						.filter(n => n);

						this.emits([ '_promiseMods', 'mods' ], [ [ null, mods ], [ channel, mods ] ]);
						break;
					}

					// There are no moderators for this room.
					case 'no_mods':
						this.emits([ '_promiseMods', 'mods' ], [ [ null, [] ], [ channel, [] ] ]);
						break;

					// The VIPs of this channel are: [..., ...]
					case 'vips_success': {
						if(msg.endsWith('.')) {
							msg = msg.slice(0, -1);
						}
						const vips = msg.split(': ')[1].toLowerCase()
						.split(', ')
						.filter(n => n);

						this.emits([ '_promiseVips', 'vips' ], [ [ null, vips ], [ channel, vips ] ]);
						break;
					}

					// There are no VIPs for this room.
					case 'no_vips':
						this.emits([ '_promiseVips', 'vips' ], [ [ null, [] ], [ channel, [] ] ]);
						break;

					// Ban command failed..
					case 'already_banned':
					case 'bad_ban_admin':
					case 'bad_ban_broadcaster':
					case 'bad_ban_global_mod':
					case 'bad_ban_self':
					case 'bad_ban_staff':
					case 'usage_ban':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseBan' ], noticeAndMsgid);
						break;

					// Ban command success..
					case 'ban_success':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseBan' ], noticeAndNull);
						break;

					// Clear command failed..
					case 'usage_clear':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseClear' ], noticeAndMsgid);
						break;

					// Mods command failed..
					case 'usage_mods':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseMods' ], [ noticeArr, [ msgid, [] ] ]);
						break;

					// Mod command success..
					case 'mod_success':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseMod' ], noticeAndNull);
						break;

					// VIPs command failed..
					case 'usage_vips':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseVips' ], [ noticeArr, [ msgid, [] ] ]);
						break;

					// VIP command failed..
					case 'usage_vip':
					case 'bad_vip_grantee_banned':
					case 'bad_vip_grantee_already_vip':
					case 'bad_vip_max_vips_reached':
					case 'bad_vip_achievement_incomplete':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseVip' ], [ noticeArr, [ msgid, [] ] ]);
						break;

					// VIP command success..
					case 'vip_success':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseVip' ], noticeAndNull);
						break;

					// Mod command failed..
					case 'usage_mod':
					case 'bad_mod_banned':
					case 'bad_mod_mod':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseMod' ], noticeAndMsgid);
						break;

					// Unmod command success..
					case 'unmod_success':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseUnmod' ], noticeAndNull);
						break;

					// Unvip command success...
					case 'unvip_success':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseUnvip' ], noticeAndNull);
						break;

					// Unmod command failed..
					case 'usage_unmod':
					case 'bad_unmod_mod':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseUnmod' ], noticeAndMsgid);
						break;

					// Unvip command failed..
					case 'usage_unvip':
					case 'bad_unvip_grantee_not_vip':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseUnvip' ], noticeAndMsgid);
						break;

					// Color command success..
					case 'color_changed':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseColor' ], noticeAndNull);
						break;

					// Color command failed..
					case 'usage_color':
					case 'turbo_only_color':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseColor' ], noticeAndMsgid);
						break;

					// Commercial command success..
					case 'commercial_success':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseCommercial' ], noticeAndNull);
						break;

					// Commercial command failed..
					case 'usage_commercial':
					case 'bad_commercial_error':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseCommercial' ], noticeAndMsgid);
						break;

					// Host command success..
					case 'hosts_remaining': {
						this.log.info(basicLog);
						const remainingHost = (!isNaN(msg[0]) ? parseInt(msg[0]) : 0);
						this.emits([ 'notice', '_promiseHost' ], [ noticeArr, [ null, ~~remainingHost ] ]);
						break;
					}

					// Host command failed..
					case 'bad_host_hosting':
					case 'bad_host_rate_exceeded':
					case 'bad_host_error':
					case 'usage_host':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseHost' ], [ noticeArr, [ msgid, null ] ]);
						break;

					// r9kbeta command failed..
					case 'already_r9k_on':
					case 'usage_r9k_on':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseR9kbeta' ], noticeAndMsgid);
						break;

					// r9kbetaoff command failed..
					case 'already_r9k_off':
					case 'usage_r9k_off':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseR9kbetaoff' ], noticeAndMsgid);
						break;

					// Timeout command success..
					case 'timeout_success':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseTimeout' ], noticeAndNull);
						break;

					case 'delete_message_success':
						this.log.info(`[${channel} ${msg}]`);
						this.emits([ 'notice', '_promiseDeletemessage' ], noticeAndNull);
						break;

					// Subscribersoff command failed..
					case 'already_subs_off':
					case 'usage_subs_off':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseSubscribersoff' ], noticeAndMsgid);
						break;

					// Subscribers command failed..
					case 'already_subs_on':
					case 'usage_subs_on':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseSubscribers' ], noticeAndMsgid);
						break;

					// Emoteonlyoff command failed..
					case 'already_emote_only_off':
					case 'usage_emote_only_off':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseEmoteonlyoff' ], noticeAndMsgid);
						break;

					// Emoteonly command failed..
					case 'already_emote_only_on':
					case 'usage_emote_only_on':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseEmoteonly' ], noticeAndMsgid);
						break;

					// Slow command failed..
					case 'usage_slow_on':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseSlow' ], noticeAndMsgid);
						break;

					// Slowoff command failed..
					case 'usage_slow_off':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseSlowoff' ], noticeAndMsgid);
						break;

					// Timeout command failed..
					case 'usage_timeout':
					case 'bad_timeout_admin':
					case 'bad_timeout_broadcaster':
					case 'bad_timeout_duration':
					case 'bad_timeout_global_mod':
					case 'bad_timeout_self':
					case 'bad_timeout_staff':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseTimeout' ], noticeAndMsgid);
						break;

					// Unban command success..
					// Unban can also be used to cancel an active timeout.
					case 'untimeout_success':
					case 'unban_success':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseUnban' ], noticeAndNull);
						break;

					// Unban command failed..
					case 'usage_unban':
					case 'bad_unban_no_ban':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseUnban' ], noticeAndMsgid);
						break;

					// Delete command failed..
					case 'usage_delete':
					case 'bad_delete_message_error':
					case 'bad_delete_message_broadcaster':
					case 'bad_delete_message_mod':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseDeletemessage' ], noticeAndMsgid);
						break;

					// Unhost command failed..
					case 'usage_unhost':
					case 'not_hosting':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseUnhost' ], noticeAndMsgid);
						break;

					// Whisper command failed..
					case 'whisper_invalid_login':
					case 'whisper_invalid_self':
					case 'whisper_limit_per_min':
					case 'whisper_limit_per_sec':
					case 'whisper_restricted':
					case 'whisper_restricted_recipient':
						this.log.info(basicLog);
						this.emits([ 'notice', '_promiseWhisper' ], noticeAndMsgid);
						break;

					// Permission error..
					case 'no_permission':
					case 'msg_banned':
					case 'msg_room_not_found':
					case 'msg_channel_suspended':
					case 'tos_ban':
					case 'invalid_user':
						this.log.info(basicLog);
						this.emits([
							'notice',
							'_promiseBan',
							'_promiseClear',
							'_promiseUnban',
							'_promiseTimeout',
							'_promiseDeletemessage',
							'_promiseMods',
							'_promiseMod',
							'_promiseUnmod',
							'_promiseVips',
							'_promiseVip',
							'_promiseUnvip',
							'_promiseCommercial',
							'_promiseHost',
							'_promiseUnhost',
							'_promiseJoin',
							'_promisePart',
							'_promiseR9kbeta',
							'_promiseR9kbetaoff',
							'_promiseSlow',
							'_promiseSlowoff',
							'_promiseFollowers',
							'_promiseFollowersoff',
							'_promiseSubscribers',
							'_promiseSubscribersoff',
							'_promiseEmoteonly',
							'_promiseEmoteonlyoff',
							'_promiseWhisper'
						], [ noticeArr, [ msgid, channel ] ]);
						break;

					// Automod-related..
					case 'msg_rejected':
					case 'msg_rejected_mandatory':
						this.log.info(basicLog);
						this.emit('automod', channel, msgid, msg);
						break;

					// Unrecognized command..
					case 'unrecognized_cmd':
						this.log.info(basicLog);
						this.emit('notice', channel, msgid, msg);
						break;

					// Send the following msg-ids to the notice event listener..
					case 'cmds_available':
					case 'host_target_went_offline':
					case 'msg_censored_broadcaster':
					case 'msg_duplicate':
					case 'msg_emoteonly':
					case 'msg_verified_email':
					case 'msg_ratelimit':
					case 'msg_subsonly':
					case 'msg_timedout':
					case 'msg_bad_characters':
					case 'msg_channel_blocked':
					case 'msg_facebook':
					case 'msg_followersonly':
					case 'msg_followersonly_followed':
					case 'msg_followersonly_zero':
					case 'msg_slowmode':
					case 'msg_suspended':
					case 'no_help':
					case 'usage_disconnect':
					case 'usage_help':
					case 'usage_me':
					case 'unavailable_command':
						this.log.info(basicLog);
						this.emit('notice', channel, msgid, msg);
						break;

					// Ignore this because we are already listening to HOSTTARGET..
					case 'host_on':
					case 'host_off':
						break;

					default:
						if(msg.includes('Login unsuccessful') || msg.includes('Login authentication failed')) {
							this.wasCloseCalled = false;
							this.reconnect = false;
							this.reason = msg;
							this.log.error(this.reason);
							this.ws.close();
						}
						else if(msg.includes('Error logging in') || msg.includes('Improperly formatted auth')) {
							this.wasCloseCalled = false;
							this.reconnect = false;
							this.reason = msg;
							this.log.error(this.reason);
							this.ws.close();
						}
						else if(msg.includes('Invalid NICK')) {
							this.wasCloseCalled = false;
							this.reconnect = false;
							this.reason = 'Invalid NICK.';
							this.log.error(this.reason);
							this.ws.close();
						}
						else {
							this.log.warn(`Could not parse NOTICE from tmi.twitch.tv:\n${JSON.stringify(message, null, 4)}`);
							this.emit('notice', channel, msgid, msg);
						}
						break;
				}
				break;
			}

			// Handle subanniversary / resub..
			case 'USERNOTICE': {
				const username = tags['display-name'] || tags['login'];
				const plan = tags['msg-param-sub-plan'] || '';
				const planName = _.unescapeIRC(_.get(tags['msg-param-sub-plan-name'], '')) || null;
				const prime = plan.includes('Prime');
				const methods = { prime, plan, planName };
				const streakMonths = ~~(tags['msg-param-streak-months'] || 0);
				const recipient = tags['msg-param-recipient-display-name'] || tags['msg-param-recipient-user-name'];
				const giftSubCount = ~~tags['msg-param-mass-gift-count'];
				tags['message-type'] = msgid;

				switch(msgid) {
					// Handle resub
					case 'resub':
						this.emits([ 'resub', 'subanniversary' ], [
							[ channel, username, streakMonths, msg, tags, methods ]
						]);
						break;

					// Handle sub
					case 'sub':
						this.emits([ 'subscription', 'sub' ], [
							[ channel, username, methods, msg, tags ]
						]);
						break;

					// Handle gift sub
					case 'subgift':
						this.emit('subgift', channel, username, streakMonths, recipient, methods, tags);
						break;

					// Handle anonymous gift sub
					// Need proof that this event occur
					case 'anonsubgift':
						this.emit('anonsubgift', channel, streakMonths, recipient, methods, tags);
						break;

					// Handle random gift subs
					case 'submysterygift':
						this.emit('submysterygift', channel, username, giftSubCount, methods, tags);
						break;

					// Handle anonymous random gift subs
					// Need proof that this event occur
					case 'anonsubmysterygift':
						this.emit('anonsubmysterygift', channel, giftSubCount, methods, tags);
						break;

					// Handle user upgrading from Prime to a normal tier sub
					case 'primepaidupgrade':
						this.emit('primepaidupgrade', channel, username, methods, tags);
						break;

					// Handle user upgrading from a gifted sub
					case 'giftpaidupgrade': {
						const sender = tags['msg-param-sender-name'] || tags['msg-param-sender-login'];
						this.emit('giftpaidupgrade', channel, username, sender, tags);
						break;
					}

					// Handle user upgrading from an anonymous gifted sub
					case 'anongiftpaidupgrade':
						this.emit('anongiftpaidupgrade', channel, username, tags);
						break;

					// Handle raid
					case 'raid': {
						const username = tags['msg-param-displayName'] || tags['msg-param-login'];
						const viewers = +tags['msg-param-viewerCount'];
						this.emit('raided', channel, username, viewers, tags);
						break;
					}
					// Handle ritual
					case 'ritual': {
						const ritualName = tags['msg-param-ritual-name'];
						switch(ritualName) {
							// Handle new chatter ritual
							case 'new_chatter':
								this.emit('newchatter', channel, username, tags, msg);
								break;
							// All unknown rituals should be passed through
							default:
								this.emit('ritual', ritualName, channel, username, tags, msg);
								break;
						}
						break;
					}
					// All other msgid events should be emitted under a usernotice event
					// until it comes up and needs to be added..
					default:
						this.emit('usernotice', msgid, channel, tags, msg);
						break;
				}
				break;
			}

			// Channel is now hosting another channel or exited host mode..
			case 'HOSTTARGET': {
				const msgSplit = msg.split(' ');
				const viewers = ~~msgSplit[1] || 0;
				// Stopped hosting..
				if(msgSplit[0] === '-') {
					this.log.info(`[${channel}] Exited host mode.`);
					this.emits([ 'unhost', '_promiseUnhost' ], [ [ channel, viewers ], [ null ] ]);
				}

				// Now hosting..
				else {
					this.log.info(`[${channel}] Now hosting ${msgSplit[0]} for ${viewers} viewer(s).`);
					this.emit('hosting', channel, msgSplit[0], viewers);
				}
				break;
			}

			// Someone has been timed out or chat has been cleared by a moderator..
			case 'CLEARCHAT':
				// User has been banned / timed out by a moderator..
				if(message.params.length > 1) {
					// Duration returns null if it's a ban, otherwise it's a timeout..
					const duration = _.get(message.tags['ban-duration'], null);

					if(duration === null) {
						this.log.info(`[${channel}] ${msg} has been banned.`);
						this.emit('ban', channel, msg, null, message.tags);
					}
					else {
						this.log.info(`[${channel}] ${msg} has been timed out for ${duration} seconds.`);
						this.emit('timeout', channel, msg, null, ~~duration, message.tags);
					}
				}

				// Chat was cleared by a moderator..
				else {
					this.log.info(`[${channel}] Chat was cleared by a moderator.`);
					this.emits([ 'clearchat', '_promiseClear' ], [ [ channel ], [ null ] ]);
				}
				break;

			// Someone's message has been deleted
			case 'CLEARMSG':
				if(message.params.length > 1) {
					const deletedMessage = msg;
					const username = tags['login'];
					tags['message-type'] = 'messagedeleted';

					this.log.info(`[${channel}] ${username}'s message has been deleted.`);
					this.emit('messagedeleted', channel, username, deletedMessage, tags);
				}
				break;

			// Received a reconnection request from the server..
			case 'RECONNECT':
				this.log.info('Received RECONNECT request from Twitch..');
				this.log.info(`Disconnecting and reconnecting in ${Math.round(this.reconnectTimer / 1000)} seconds..`);
				this.disconnect().catch(err => this.log.error(err));
				setTimeout(() => this.connect().catch(err => this.log.error(err)), this.reconnectTimer);
				break;

			// Received when joining a channel and every time you send a PRIVMSG to a channel.
			case 'USERSTATE':
				message.tags.username = this.username;

				// Add the client to the moderators of this room..
				if(message.tags['user-type'] === 'mod') {
					if(!this.moderators[channel]) {
						this.moderators[channel] = [];
					}
					if(!this.moderators[channel].includes(this.username)) {
						this.moderators[channel].push(this.username);
					}
				}

				// Logged in and username doesn't start with justinfan..
				if(!_.isJustinfan(this.getUsername()) && !this.userstate[channel]) {
					this.userstate[channel] = tags;
					this.lastJoined = channel;
					this.channels.push(channel);
					this.log.info(`Joined ${channel}`);
					this.emit('join', channel, _.username(this.getUsername()), true);
				}

				// Emote-sets has changed, update it..
				if(message.tags['emote-sets'] !== this.emotes) {
					this._updateEmoteset(message.tags['emote-sets']);
				}

				this.userstate[channel] = tags;
				break;

			// Describe non-channel-specific state informations..
			case 'GLOBALUSERSTATE':
				this.globaluserstate = tags;
				this.emit('globaluserstate', tags);

				// Received emote-sets..
				if(typeof message.tags['emote-sets'] !== 'undefined') {
					this._updateEmoteset(message.tags['emote-sets']);
				}
				break;

			// Received when joining a channel and every time one of the chat room settings, like slow mode, change.
			// The message on join contains all room settings.
			case 'ROOMSTATE':
				// We use this notice to know if we successfully joined a channel..
				if(_.channel(this.lastJoined) === channel) { this.emit('_promiseJoin', null, channel); }

				// Provide the channel name in the tags before emitting it..
				message.tags.channel = channel;
				this.emit('roomstate', channel, message.tags);

				if(!_.hasOwn(message.tags, 'subs-only')) {
					// Handle slow mode here instead of the slow_on/off notice..
					// This room is now in slow mode. You may send messages every slow_duration seconds.
					if(_.hasOwn(message.tags, 'slow')) {
						if(typeof message.tags.slow === 'boolean' && !message.tags.slow) {
							const disabled = [ channel, false, 0 ];
							this.log.info(`[${channel}] This room is no longer in slow mode.`);
							this.emits([ 'slow', 'slowmode', '_promiseSlowoff' ], [ disabled, disabled, [ null ] ]);
						}
						else {
							const seconds = ~~message.tags.slow;
							const enabled = [ channel, true, seconds ];
							this.log.info(`[${channel}] This room is now in slow mode.`);
							this.emits([ 'slow', 'slowmode', '_promiseSlow' ], [ enabled, enabled, [ null ] ]);
						}
					}

					// Handle followers only mode here instead of the followers_on/off notice..
					// This room is now in follower-only mode.
					// This room is now in <duration> followers-only mode.
					// This room is no longer in followers-only mode.
					// duration is in minutes (string)
					// -1 when /followersoff (string)
					// false when /followers with no duration (boolean)
					if(_.hasOwn(message.tags, 'followers-only')) {
						if(message.tags['followers-only'] === '-1') {
							const disabled = [ channel, false, 0 ];
							this.log.info(`[${channel}] This room is no longer in followers-only mode.`);
							this.emits([ 'followersonly', 'followersmode', '_promiseFollowersoff' ], [ disabled, disabled, [ null ] ]);
						}
						else {
							const minutes = ~~message.tags['followers-only'];
							const enabled = [ channel, true, minutes ];
							this.log.info(`[${channel}] This room is now in follower-only mode.`);
							this.emits([ 'followersonly', 'followersmode', '_promiseFollowers' ], [ enabled, enabled, [ null ] ]);
						}
					}
				}
				break;

			// Wrong cluster..
			case 'SERVERCHANGE':
				break;

			default:
				this.log.warn(`Could not parse message from tmi.twitch.tv:\n${JSON.stringify(message, null, 4)}`);
				break;
		}
	}


	// Messages from jtv..
	else if(message.prefix === 'jtv') {
		switch(message.command) {
			case 'MODE':
				if(msg === '+o') {
					// Add username to the moderators..
					if(!this.moderators[channel]) {
						this.moderators[channel] = [];
					}
					if(!this.moderators[channel].includes(message.params[2])) {
						this.moderators[channel].push(message.params[2]);
					}

					this.emit('mod', channel, message.params[2]);
				}
				else if(msg === '-o') {
					// Remove username from the moderators..
					if(!this.moderators[channel]) {
						this.moderators[channel] = [];
					}
					this.moderators[channel].filter(value => value !== message.params[2]);

					this.emit('unmod', channel, message.params[2]);
				}
				break;

			default:
				this.log.warn(`Could not parse message from jtv:\n${JSON.stringify(message, null, 4)}`);
				break;
		}
	}


	// Anything else..
	else {
		switch(message.command) {
			case '353':
				this.emit('names', message.params[2], message.params[3].split(' '));
				break;

			case '366':
				break;

			// Someone has joined the channel..
			case 'JOIN': {
				const nick = message.prefix.split('!')[0];
				// Joined a channel as a justinfan (anonymous) user..
				if(_.isJustinfan(this.getUsername()) && this.username === nick) {
					this.lastJoined = channel;
					this.channels.push(channel);
					this.log.info(`Joined ${channel}`);
					this.emit('join', channel, nick, true);
				}

				// Someone else joined the channel, just emit the join event..
				if(this.username !== nick) {
					this.emit('join', channel, nick, false);
				}
				break;
			}

			// Someone has left the channel..
			case 'PART': {
				let isSelf = false;
				const nick = message.prefix.split('!')[0];
				// Client left a channel..
				if(this.username === nick) {
					isSelf = true;
					if(this.userstate[channel]) { delete this.userstate[channel]; }

					let index = this.channels.indexOf(channel);
					if(index !== -1) { this.channels.splice(index, 1); }

					index = this.opts.channels.indexOf(channel);
					if(index !== -1) { this.opts.channels.splice(index, 1); }

					this.log.info(`Left ${channel}`);
					this.emit('_promisePart', null);
				}

				// Client or someone else left the channel, emit the part event..
				this.emit('part', channel, nick, isSelf);
				break;
			}

			// Received a whisper..
			case 'WHISPER': {
				const nick = message.prefix.split('!')[0];
				this.log.info(`[WHISPER] <${nick}>: ${msg}`);

				// Update the tags to provide the username..
				if(!_.hasOwn(message.tags, 'username')) {
					message.tags.username = nick;
				}
				message.tags['message-type'] = 'whisper';

				const from = _.channel(message.tags.username);
				// Emit for both, whisper and message..
				this.emits([ 'whisper', 'message' ], [
					[ from, message.tags, msg, false ]
				]);
				break;
			}

			case 'PRIVMSG':
				// Add username (lowercase) to the tags..
				message.tags.username = message.prefix.split('!')[0];

				// Message from JTV..
				if(message.tags.username === 'jtv') {
					const name = _.username(msg.split(' ')[0]);
					const autohost = msg.includes('auto');
					// Someone is hosting the channel and the message contains how many viewers..
					if(msg.includes('hosting you for')) {
						const count = _.extractNumber(msg);

						this.emit('hosted', channel, name, count, autohost);
					}


					// Some is hosting the channel, but no viewer(s) count provided in the message..
					else if(msg.includes('hosting you')) {
						this.emit('hosted', channel, name, 0, autohost);
					}
				}

				else {
					const messagesLogLevel = _.get(this.opts.options.messagesLogLevel, 'info');

					// Message is an action (/me <message>)..
					const actionMessage = _.actionMessage(msg);
					message.tags['message-type'] = actionMessage ? 'action' : 'chat';
					msg = actionMessage ? actionMessage[1] : msg;
					// Check for Bits prior to actions message
					if(_.hasOwn(message.tags, 'bits')) {
						this.emit('cheer', channel, message.tags, msg);
					}
					else {
						//Handle Channel Point Redemptions (Require's Text Input)
						if(_.hasOwn(message.tags, 'msg-id')) {
							if(message.tags['msg-id'] === 'highlighted-message') {
								const rewardtype = message.tags['msg-id'];
								this.emit('redeem', channel, message.tags.username, rewardtype, message.tags, msg);
							}
							else if(message.tags['msg-id'] === 'skip-subs-mode-message') {
								const rewardtype = message.tags['msg-id'];
								this.emit('redeem', channel, message.tags.username, rewardtype, message.tags, msg);
							}
						}
						else if(_.hasOwn(message.tags, 'custom-reward-id')) {
							const rewardtype = message.tags['custom-reward-id'];
							this.emit('redeem', channel, message.tags.username, rewardtype, message.tags, msg);
						}
						if(actionMessage) {
							this.log[messagesLogLevel](`[${channel}] *<${message.tags.username}>: ${msg}`);
							this.emits([ 'action', 'message' ], [
								[ channel, message.tags, msg, false ]
							]);
						}

						// Message is a regular chat message..
						else {
							this.log[messagesLogLevel](`[${channel}] <${message.tags.username}>: ${msg}`);
							this.emits([ 'chat', 'message' ], [
								[ channel, message.tags, msg, false ]
							]);
						}
					}
				}
				break;

			default:
				this.log.warn(`Could not parse message:\n${JSON.stringify(message, null, 4)}`);
				break;
		}
	}
};
// Connect to server..
client.prototype.connect = function connect() {
	return new Promise((resolve, reject) => {
		this.server = _.get(this.opts.connection.server, 'irc-ws.chat.twitch.tv');
		this.port = _.get(this.opts.connection.port, 80);

		// Override port if using a secure connection..
		if(this.secure) { this.port = 443; }
		if(this.port === 443) { this.secure = true; }

		this.reconnectTimer = this.reconnectTimer * this.reconnectDecay;
		if(this.reconnectTimer >= this.maxReconnectInterval) {
			this.reconnectTimer = this.maxReconnectInterval;
		}

		// Connect to server from configuration..
		this._openConnection();
		this.once('_promiseConnect', err => {
			if(!err) { resolve([ this.server, ~~this.port ]); }
			else { reject(err); }
		});
	});
};
// Open a connection..
client.prototype._openConnection = function _openConnection() {
	this.ws = new _WebSocket(`${this.secure ? 'wss' : 'ws'}://${this.server}:${this.port}/`, 'irc');

	this.ws.onmessage = this._onMessage.bind(this);
	this.ws.onerror = this._onError.bind(this);
	this.ws.onclose = this._onClose.bind(this);
	this.ws.onopen = this._onOpen.bind(this);
};
// Called when the WebSocket connection's readyState changes to OPEN.
// Indicates that the connection is ready to send and receive data..
client.prototype._onOpen = function _onOpen() {
	if(!this._isConnected()) {
		return;
	}

	// Emitting "connecting" event..
	this.log.info(`Connecting to ${this.server} on port ${this.port}..`);
	this.emit('connecting', this.server, ~~this.port);

	this.username = _.get(this.opts.identity.username, _.justinfan());
	this._getToken()
	.then(token => {
		const password = _.password(token);

		// Emitting "logon" event..
		this.log.info('Sending authentication to server..');
		this.emit('logon');

		let caps = 'twitch.tv/tags twitch.tv/commands';
		if(!this._skipMembership) {
			caps += ' twitch.tv/membership';
		}
		this.ws.send('CAP REQ :' + caps);

		// Authentication..
		if(password) {
			this.ws.send(`PASS ${password}`);
		}
		else if(_.isJustinfan(this.username)) {
			this.ws.send('PASS SCHMOOPIIE');
		}
		this.ws.send(`NICK ${this.username}`);
	})
	.catch(err => {
		this.emits([ '_promiseConnect', 'disconnected' ], [ [ err ], [ 'Could not get a token.' ] ]);
	});
};
// Fetches a token from the option.
client.prototype._getToken = function _getToken() {
	const passwordOption = this.opts.identity.password;
	let password;
	if(typeof passwordOption === 'function') {
		password = passwordOption();
		if(password instanceof Promise) {
			return password;
		}
		return Promise.resolve(password);
	}
	return Promise.resolve(passwordOption);
};
// Called when a message is received from the server..
client.prototype._onMessage = function _onMessage(event) {
	const parts = event.data.trim().split('\r\n');

	parts.forEach(str => {
		const msg = parse.msg(str);
		if(msg) {
			this.handleMessage(msg);
		}
	});
};
// Called when an error occurs..
client.prototype._onError = function _onError() {
	this.moderators = {};
	this.userstate = {};
	this.globaluserstate = {};

	// Stop the internal ping timeout check interval..
	clearInterval(this.pingLoop);
	clearTimeout(this.pingTimeout);

	this.reason = this.ws === null ? 'Connection closed.' : 'Unable to connect.';

	this.emits([ '_promiseConnect', 'disconnected' ], [ [ this.reason ] ]);

	// Reconnect to server..
	if(this.reconnect && this.reconnections === this.maxReconnectAttempts) {
		this.emit('maxreconnect');
		this.log.error('Maximum reconnection attempts reached.');
	}
	if(this.reconnect && !this.reconnecting && this.reconnections <= this.maxReconnectAttempts - 1) {
		this.reconnecting = true;
		this.reconnections = this.reconnections + 1;
		this.log.error(`Reconnecting in ${Math.round(this.reconnectTimer / 1000)} seconds..`);
		this.emit('reconnect');
		setTimeout(() => {
			this.reconnecting = false;
			this.connect().catch(err => this.log.error(err));
		}, this.reconnectTimer);
	}

	this.ws = null;
};
// Called when the WebSocket connection's readyState changes to CLOSED..
client.prototype._onClose = function _onClose() {
	this.moderators = {};
	this.userstate = {};
	this.globaluserstate = {};

	// Stop the internal ping timeout check interval..
	clearInterval(this.pingLoop);
	clearTimeout(this.pingTimeout);

	// User called .disconnect(), don't try to reconnect.
	if(this.wasCloseCalled) {
		this.wasCloseCalled = false;
		this.reason = 'Connection closed.';
		this.log.info(this.reason);
		this.emits([ '_promiseConnect', '_promiseDisconnect', 'disconnected' ], [ [ this.reason ], [ null ], [ this.reason ] ]);
	}

	// Got disconnected from server..
	else {
		this.emits([ '_promiseConnect', 'disconnected' ], [ [ this.reason ] ]);

		// Reconnect to server..
		if(this.reconnect && this.reconnections === this.maxReconnectAttempts) {
			this.emit('maxreconnect');
			this.log.error('Maximum reconnection attempts reached.');
		}
		if(this.reconnect && !this.reconnecting && this.reconnections <= this.maxReconnectAttempts - 1) {
			this.reconnecting = true;
			this.reconnections = this.reconnections + 1;
			this.log.error(`Could not connect to server. Reconnecting in ${Math.round(this.reconnectTimer / 1000)} seconds..`);
			this.emit('reconnect');
			setTimeout(() => {
				this.reconnecting = false;
				this.connect().catch(err => this.log.error(err));
			}, this.reconnectTimer);
		}
	}

	this.ws = null;
};
// Minimum of 600ms for command promises, if current latency exceeds, add 100ms to it to make sure it doesn't get timed out..
client.prototype._getPromiseDelay = function _getPromiseDelay() {
	if(this.currentLatency <= 600) { return 600; }
	else { return this.currentLatency + 100; }
};
// Send command to server or channel..
client.prototype._sendCommand = function _sendCommand(delay, channel, command, fn) {
	// Race promise against delay..
	return new Promise((resolve, reject) => {
		// Make sure the socket is opened..
		if(!this._isConnected()) {
			// Disconnected from server..
			return reject('Not connected to server.');
		}
		else if(typeof delay === 'number') {
			_.promiseDelay(delay).then(() => reject('No response from Twitch.'));
		}

		// Executing a command on a channel..
		if(channel !== null) {
			const chan = _.channel(channel);
			this.log.info(`[${chan}] Executing command: ${command}`);
			this.ws.send(`PRIVMSG ${chan} :${command}`);
		}


		// Executing a raw command..
		else {
			this.log.info(`Executing command: ${command}`);
			this.ws.send(command);
		}
		if(typeof fn === 'function') {
			fn(resolve, reject);
		}
		else {
			resolve();
		}
	});
};
// Send a message to channel..
client.prototype._sendMessage = function _sendMessage(delay, channel, message, fn) {
	// Promise a result..
	return new Promise((resolve, reject) => {
		// Make sure the socket is opened and not logged in as a justinfan user..
		if(!this._isConnected()) {
			return reject('Not connected to server.');
		}
		else if(_.isJustinfan(this.getUsername())) {
			return reject('Cannot send anonymous messages.');
		}
		const chan = _.channel(channel);
		if(!this.userstate[chan]) { this.userstate[chan] = {}; }

		// Split long lines otherwise they will be eaten by the server..
		if(message.length >= 500) {
			const msg = _.splitLine(message, 500);
			message = msg[0];

			setTimeout(() => {
				this._sendMessage(delay, channel, msg[1], () => {});
			}, 350);
		}

		this.ws.send(`PRIVMSG ${chan} :${message}`);

		const emotes = {};

		// Parse regex and string emotes..
		Object.keys(this.emotesets).forEach(id => this.emotesets[id].forEach(emote => {
			const emoteFunc = _.isRegex(emote.code) ? parse.emoteRegex : parse.emoteString;
			return emoteFunc(message, emote.code, emote.id, emotes);
		})
		);

		// Merge userstate with parsed emotes..
		const userstate = Object.assign(
			this.userstate[chan],
			parse.emotes({ emotes: parse.transformEmotes(emotes) || null })
		);

		const messagesLogLevel = _.get(this.opts.options.messagesLogLevel, 'info');

		// Message is an action (/me <message>)..
		const actionMessage = _.actionMessage(message);
		if(actionMessage) {
			userstate['message-type'] = 'action';
			this.log[messagesLogLevel](`[${chan}] *<${this.getUsername()}>: ${actionMessage[1]}`);
			this.emits([ 'action', 'message' ], [
				[ chan, userstate, actionMessage[1], true ]
			]);
		}


		// Message is a regular chat message..
		else {
			userstate['message-type'] = 'chat';
			this.log[messagesLogLevel](`[${chan}] <${this.getUsername()}>: ${message}`);
			this.emits([ 'chat', 'message' ], [
				[ chan, userstate, message, true ]
			]);
		}
		if(typeof fn === 'function') {
			fn(resolve, reject);
		}
		else {
			resolve();
		}
	});
};
// Grab the emote-sets object from the API..
client.prototype._updateEmoteset = function _updateEmoteset(sets) {
	let setsChanges = sets !== undefined;
	if(setsChanges) {
		if(sets === this.emotes) {
			setsChanges = false;
		}
		else {
			this.emotes = sets;
		}
	}
	if(this._skipUpdatingEmotesets) {
		if(setsChanges) {
			this.emit('emotesets', sets, {});
		}
		return;
	}
	const setEmotesetTimer = () => {
		if(this._updateEmotesetsTimerDelay > 0) {
			clearTimeout(this._updateEmotesetsTimer);
			this._updateEmotesetsTimer = setTimeout(() => this._updateEmoteset(), this._updateEmotesetsTimerDelay);
		}
	};
	this._getToken()
	.then(token => {
		const url = `https://api.twitch.tv/kraken/chat/emoticon_images?emotesets=${sets}`;
		/** @type {import('node-fetch').Response} */
		return _fetch(url, {
			headers: {
				'Accept': 'application/vnd.twitchtv.v5+json',
				'Authorization': `OAuth ${_.token(token)}`,
				'Client-ID': this.clientId
			}
		});
	})
	.then(res => res.json())
	.then(data => {
		this.emotesets = data.emoticon_sets || {};
		this.emit('emotesets', sets, this.emotesets);
		setEmotesetTimer();
	})
	.catch(() => setEmotesetTimer());
};
// Get current username..
client.prototype.getUsername = function getUsername() {
	return this.username;
};
// Get current options..
client.prototype.getOptions = function getOptions() {
	return this.opts;
};
// Get current channels..
client.prototype.getChannels = function getChannels() {
	return this.channels;
};
// Check if username is a moderator on a channel..
client.prototype.isMod = function isMod(channel, username) {
	const chan = _.channel(channel);
	if(!this.moderators[chan]) { this.moderators[chan] = []; }
	return this.moderators[chan].includes(_.username(username));
};
// Get readyState..
client.prototype.readyState = function readyState() {
	if(this.ws === null) { return 'CLOSED'; }
	return [ 'CONNECTING', 'OPEN', 'CLOSING', 'CLOSED' ][this.ws.readyState];
};
// Determine if the client has a WebSocket and it's open..
client.prototype._isConnected = function _isConnected() {
	return this.ws !== null && this.ws.readyState === 1;
};
// Disconnect from server..
client.prototype.disconnect = function disconnect() {
	return new Promise((resolve, reject) => {
		if(this.ws !== null && this.ws.readyState !== 3) {
			this.wasCloseCalled = true;
			this.log.info('Disconnecting from server..');
			this.ws.close();
			this.once('_promiseDisconnect', () => resolve([ this.server, ~~this.port ]));
		}
		else {
			this.log.error('Cannot disconnect from server. Socket is not opened or connection is already closing.');
			reject('Cannot disconnect from server. Socket is not opened or connection is already closing.');
		}
	});
};
client.prototype.off = client.prototype.removeListener;

// Expose everything, for browser and Node..
if( true && module.exports) {
	module.exports = client;
}
if(typeof window !== 'undefined') {
	window.tmi = {};
	window.tmi.client = client;
	window.tmi.Client = client;
}


/***/ }),

/***/ 169:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const _ = __nccwpck_require__(658);

// Enable followers-only mode on a channel..
function followersonly(channel, minutes) {
	channel = _.channel(channel);
	minutes = _.get(minutes, 30);
	// Send the command to the server and race the Promise against a delay..
	return this._sendCommand(this._getPromiseDelay(), channel, `/followers ${minutes}`, (resolve, reject) => {
		// Received _promiseFollowers event, resolve or reject..
		this.once('_promiseFollowers', err => {
			if(!err) { resolve([ channel, ~~minutes ]); }
			else { reject(err); }
		});
	});
}

// Disable followers-only mode on a channel..
function followersonlyoff(channel) {
	channel = _.channel(channel);
	// Send the command to the server and race the Promise against a delay..
	return this._sendCommand(this._getPromiseDelay(), channel, '/followersoff', (resolve, reject) => {
		// Received _promiseFollowersoff event, resolve or reject..
		this.once('_promiseFollowersoff', err => {
			if(!err) { resolve([ channel ]); }
			else { reject(err); }
		});
	});
}

// Leave a channel..
function part(channel) {
	channel = _.channel(channel);
	// Send the command to the server and race the Promise against a delay..
	return this._sendCommand(this._getPromiseDelay(), null, `PART ${channel}`, (resolve, reject) => {
		// Received _promisePart event, resolve or reject..
		this.once('_promisePart', err => {
			if(!err) { resolve([ channel ]); }
			else { reject(err); }
		});
	});
}

// Enable R9KBeta mode on a channel..
function r9kbeta(channel) {
	channel = _.channel(channel);
	// Send the command to the server and race the Promise against a delay..
	return this._sendCommand(this._getPromiseDelay(), channel, '/r9kbeta', (resolve, reject) => {
		// Received _promiseR9kbeta event, resolve or reject..
		this.once('_promiseR9kbeta', err => {
			if(!err) { resolve([ channel ]); }
			else { reject(err); }
		});
	});
}

// Disable R9KBeta mode on a channel..
function r9kbetaoff(channel) {
	channel = _.channel(channel);
	// Send the command to the server and race the Promise against a delay..
	return this._sendCommand(this._getPromiseDelay(), channel, '/r9kbetaoff', (resolve, reject) => {
		// Received _promiseR9kbetaoff event, resolve or reject..
		this.once('_promiseR9kbetaoff', err => {
			if(!err) { resolve([ channel ]); }
			else { reject(err); }
		});
	});
}

// Enable slow mode on a channel..
function slow(channel, seconds) {
	channel = _.channel(channel);
	seconds = _.get(seconds, 300);
	// Send the command to the server and race the Promise against a delay..
	return this._sendCommand(this._getPromiseDelay(), channel, `/slow ${seconds}`, (resolve, reject) => {
		// Received _promiseSlow event, resolve or reject..
		this.once('_promiseSlow', err => {
			if(!err) { resolve([ channel, ~~seconds ]); }
			else { reject(err); }
		});
	});
}

// Disable slow mode on a channel..
function slowoff(channel) {
	channel = _.channel(channel);
	// Send the command to the server and race the Promise against a delay..
	return this._sendCommand(this._getPromiseDelay(), channel, '/slowoff', (resolve, reject) => {
		// Received _promiseSlowoff event, resolve or reject..
		this.once('_promiseSlowoff', err => {
			if(!err) { resolve([ channel ]); }
			else { reject(err); }
		});
	});
}

module.exports = {
	// Send action message (/me <message>) on a channel..
	action(channel, message) {
		channel = _.channel(channel);
		message = `\u0001ACTION ${message}\u0001`;
		// Send the command to the server and race the Promise against a delay..
		return this._sendMessage(this._getPromiseDelay(), channel, message, (resolve, _reject) => {
			// At this time, there is no possible way to detect if a message has been sent has been eaten
			// by the server, so we can only resolve the Promise.
			resolve([ channel, message ]);
		});
	},

	// Ban username on channel..
	ban(channel, username, reason) {
		channel = _.channel(channel);
		username = _.username(username);
		reason = _.get(reason, '');
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, `/ban ${username} ${reason}`, (resolve, reject) => {
			// Received _promiseBan event, resolve or reject..
			this.once('_promiseBan', err => {
				if(!err) { resolve([ channel, username, reason ]); }
				else { reject(err); }
			});
		});
	},

	// Clear all messages on a channel..
	clear(channel) {
		channel = _.channel(channel);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, '/clear', (resolve, reject) => {
			// Received _promiseClear event, resolve or reject..
			this.once('_promiseClear', err => {
				if(!err) { resolve([ channel ]); }
				else { reject(err); }
			});
		});
	},

	// Change the color of your username..
	color(channel, newColor) {
		newColor = _.get(newColor, channel);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), '#tmijs', `/color ${newColor}`, (resolve, reject) => {
			// Received _promiseColor event, resolve or reject..
			this.once('_promiseColor', err => {
				if(!err) { resolve([ newColor ]); }
				else { reject(err); }
			});
		});
	},

	// Run commercial on a channel for X seconds..
	commercial(channel, seconds) {
		channel = _.channel(channel);
		seconds = _.get(seconds, 30);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, `/commercial ${seconds}`, (resolve, reject) => {
			// Received _promiseCommercial event, resolve or reject..
			this.once('_promiseCommercial', err => {
				if(!err) { resolve([ channel, ~~seconds ]); }
				else { reject(err); }
			});
		});
	},
	
	// Delete a specific message on a channel
	deletemessage(channel, messageUUID) {
		channel = _.channel(channel);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, `/delete ${messageUUID}`, (resolve, reject) => {
			// Received _promiseDeletemessage event, resolve or reject..
			this.once('_promiseDeletemessage', err => {
				if(!err) { resolve([ channel ]); }
				else { reject(err); }
			});
		});
	},

	// Enable emote-only mode on a channel..
	emoteonly(channel) {
		channel = _.channel(channel);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, '/emoteonly', (resolve, reject) => {
			// Received _promiseEmoteonly event, resolve or reject..
			this.once('_promiseEmoteonly', err => {
				if(!err) { resolve([ channel ]); }
				else { reject(err); }
			});
		});
	},

	// Disable emote-only mode on a channel..
	emoteonlyoff(channel) {
		channel = _.channel(channel);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, '/emoteonlyoff', (resolve, reject) => {
			// Received _promiseEmoteonlyoff event, resolve or reject..
			this.once('_promiseEmoteonlyoff', err => {
				if(!err) { resolve([ channel ]); }
				else { reject(err); }
			});
		});
	},

	// Enable followers-only mode on a channel..
	followersonly: followersonly,

	// Alias for followersonly()..
	followersmode: followersonly,

	// Disable followers-only mode on a channel..
	followersonlyoff: followersonlyoff,

	// Alias for followersonlyoff()..
	followersmodeoff: followersonlyoff,

	// Host a channel..
	host(channel, target) {
		channel = _.channel(channel);
		target = _.username(target);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(2000, channel, `/host ${target}`, (resolve, reject) => {
			// Received _promiseHost event, resolve or reject..
			this.once('_promiseHost', (err, remaining) => {
				if(!err) { resolve([ channel, target, ~~remaining ]); }
				else { reject(err); }
			});
		});
	},

	// Join a channel..
	join(channel) {
		channel = _.channel(channel);
		// Send the command to the server ..
		return this._sendCommand(null, null, `JOIN ${channel}`, (resolve, reject) => {
			const eventName = '_promiseJoin';
			let hasFulfilled = false;
			const listener = (err, joinedChannel) => {
				if(channel === _.channel(joinedChannel)) {
					// Received _promiseJoin event for the target channel, resolve or reject..
					this.removeListener(eventName, listener);
					hasFulfilled = true;
					if(!err) { resolve([ channel ]); }
					else { reject(err); }
				}
			};
			this.on(eventName, listener);
			// Race the Promise against a delay..
			const delay = this._getPromiseDelay();
			_.promiseDelay(delay).then(() => {
				if(!hasFulfilled) {
					this.emit(eventName, 'No response from Twitch.', channel);
				}
			});
		});
	},

	// Mod username on channel..
	mod(channel, username) {
		channel = _.channel(channel);
		username = _.username(username);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, `/mod ${username}`, (resolve, reject) => {
			// Received _promiseMod event, resolve or reject..
			this.once('_promiseMod', err => {
				if(!err) { resolve([ channel, username ]); }
				else { reject(err); }
			});
		});
	},

	// Get list of mods on a channel..
	mods(channel) {
		channel = _.channel(channel);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, '/mods', (resolve, reject) => {
			// Received _promiseMods event, resolve or reject..
			this.once('_promiseMods', (err, mods) => {
				if(!err) {
					// Update the internal list of moderators..
					mods.forEach(username => {
						if(!this.moderators[channel]) { this.moderators[channel] = []; }
						if(!this.moderators[channel].includes(username)) { this.moderators[channel].push(username); }
					});
					resolve(mods);
				}
				else { reject(err); }
			});
		});
	},

	// Leave a channel..
	part: part,

	// Alias for part()..
	leave: part,

	// Send a ping to the server..
	ping() {
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), null, 'PING', (resolve, _reject) => {
			// Update the internal ping timeout check interval..
			this.latency = new Date();
			this.pingTimeout = setTimeout(() => {
				if(this.ws !== null) {
					this.wasCloseCalled = false;
					this.log.error('Ping timeout.');
					this.ws.close();

					clearInterval(this.pingLoop);
					clearTimeout(this.pingTimeout);
				}
			}, _.get(this.opts.connection.timeout, 9999));

			// Received _promisePing event, resolve or reject..
			this.once('_promisePing', latency => resolve([ parseFloat(latency) ]));
		});
	},

	// Enable R9KBeta mode on a channel..
	r9kbeta: r9kbeta,

	// Alias for r9kbeta()..
	r9kmode: r9kbeta,

	// Disable R9KBeta mode on a channel..
	r9kbetaoff: r9kbetaoff,

	// Alias for r9kbetaoff()..
	r9kmodeoff: r9kbetaoff,

	// Send a raw message to the server..
	raw(message) {
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), null, message, (resolve, _reject) => {
			resolve([ message ]);
		});
	},

	// Send a message on a channel..
	say(channel, message) {
		channel = _.channel(channel);

		if((message.startsWith('.') && !message.startsWith('..')) || message.startsWith('/') || message.startsWith('\\')) {
			// Check if the message is an action message..
			if(message.substr(1, 3) === 'me ') {
				return this.action(channel, message.substr(4));
			}
			else {
				// Send the command to the server and race the Promise against a delay..
				return this._sendCommand(this._getPromiseDelay(), channel, message, (resolve, _reject) => {
					// At this time, there is no possible way to detect if a message has been sent has been eaten
					// by the server, so we can only resolve the Promise.
					resolve([ channel, message ]);
				});
			}
		}
		// Send the command to the server and race the Promise against a delay..
		return this._sendMessage(this._getPromiseDelay(), channel, message, (resolve, _reject) => {
			// At this time, there is no possible way to detect if a message has been sent has been eaten
			// by the server, so we can only resolve the Promise.
			resolve([ channel, message ]);
		});
	},

	// Enable slow mode on a channel..
	slow: slow,

	// Alias for slow()..
	slowmode: slow,

	// Disable slow mode on a channel..
	slowoff: slowoff,

	// Alias for slowoff()..
	slowmodeoff: slowoff,

	// Enable subscribers mode on a channel..
	subscribers(channel) {
		channel = _.channel(channel);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, '/subscribers', (resolve, reject) => {
			// Received _promiseSubscribers event, resolve or reject..
			this.once('_promiseSubscribers', err => {
				if(!err) { resolve([ channel ]); }
				else { reject(err); }
			});
		});
	},

	// Disable subscribers mode on a channel..
	subscribersoff(channel) {
		channel = _.channel(channel);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, '/subscribersoff', (resolve, reject) => {
			// Received _promiseSubscribersoff event, resolve or reject..
			this.once('_promiseSubscribersoff', err => {
				if(!err) { resolve([ channel ]); }
				else { reject(err); }
			});
		});
	},

	// Timeout username on channel for X seconds..
	timeout(channel, username, seconds, reason) {
		channel = _.channel(channel);
		username = _.username(username);

		if(seconds !== null && !_.isInteger(seconds)) {
			reason = seconds;
			seconds = 300;
		}

		seconds = _.get(seconds, 300);
		reason = _.get(reason, '');
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, `/timeout ${username} ${seconds} ${reason}`, (resolve, reject) => {
			// Received _promiseTimeout event, resolve or reject..
			this.once('_promiseTimeout', err => {
				if(!err) { resolve([ channel, username, ~~seconds, reason ]); }
				else { reject(err); }
			});
		});
	},

	// Unban username on channel..
	unban(channel, username) {
		channel = _.channel(channel);
		username = _.username(username);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, `/unban ${username}`, (resolve, reject) => {
			// Received _promiseUnban event, resolve or reject..
			this.once('_promiseUnban', err => {
				if(!err) { resolve([ channel, username ]); }
				else { reject(err); }
			});
		});
	},

	// End the current hosting..
	unhost(channel) {
		channel = _.channel(channel);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(2000, channel, '/unhost', (resolve, reject) => {
			// Received _promiseUnhost event, resolve or reject..
			this.once('_promiseUnhost', err => {
				if(!err) { resolve([ channel ]); }
				else { reject(err); }
			});
		});
	},

	// Unmod username on channel..
	unmod(channel, username) {
		channel = _.channel(channel);
		username = _.username(username);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, `/unmod ${username}`, (resolve, reject) => {
			// Received _promiseUnmod event, resolve or reject..
			this.once('_promiseUnmod', err => {
				if(!err) { resolve([ channel, username ]); }
				else { reject(err); }
			});
		});
	},

	// Unvip username on channel..
	unvip(channel, username) {
		channel = _.channel(channel);
		username = _.username(username);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, `/unvip ${username}`, (resolve, reject) => {
			// Received _promiseUnvip event, resolve or reject..
			this.once('_promiseUnvip', err => {
				if(!err) { resolve([ channel, username ]); }
				else { reject(err); }
			});
		});
	},

	// Add username to VIP list on channel..
	vip(channel, username) {
		channel = _.channel(channel);
		username = _.username(username);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, `/vip ${username}`, (resolve, reject) => {
			// Received _promiseVip event, resolve or reject..
			this.once('_promiseVip', err => {
				if(!err) { resolve([ channel, username ]); }
				else { reject(err); }
			});
		});
	},

	// Get list of VIPs on a channel..
	vips(channel) {
		channel = _.channel(channel);
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), channel, '/vips', (resolve, reject) => {
			// Received _promiseVips event, resolve or reject..
			this.once('_promiseVips', (err, vips) => {
				if(!err) { resolve(vips); }
				else { reject(err); }
			});
		});
	},

	// Send an whisper message to a user..
	whisper(username, message) {
		username = _.username(username);

		// The server will not send a whisper to the account that sent it.
		if(username === this.getUsername()) {
			return Promise.reject('Cannot send a whisper to the same account.');
		}
		// Send the command to the server and race the Promise against a delay..
		return this._sendCommand(this._getPromiseDelay(), '#tmijs', `/w ${username} ${message}`, (_resolve, reject) => {
			this.once('_promiseWhisper', err => {
				if (err) { reject(err); }
			});
		}).catch(err => {
			// Either an "actual" error occured or the timeout triggered
			// the latter means no errors have occured and we can resolve
			// else just elevate the error
			if(err && typeof err === 'string' && err.indexOf('No response from Twitch.') !== 0) {
				throw err;
			}
			const from = _.channel(username);
			const userstate = Object.assign({
				'message-type': 'whisper',
				'message-id': null,
				'thread-id': null,
				username: this.getUsername()
			}, this.globaluserstate);

			// Emit for both, whisper and message..
			this.emits([ 'whisper', 'message' ], [
				[ from, userstate, message, true ],
				[ from, userstate, message, true ]
			]);
			return [ username, message ];
		});
	}
};


/***/ }),

/***/ 687:
/***/ ((module) => {

/* istanbul ignore file */
/* eslint-disable */
/*
 * Copyright Joyent, Inc. and other Node contributors.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
 * NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
 * USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function EventEmitter() {
	this._events = this._events || {};
	this._maxListeners = this._maxListeners || undefined;
}

module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
	if (!isNumber(n) || n < 0 || isNaN(n)) {
		throw TypeError("n must be a positive number");
	}

	this._maxListeners = n;

	return this;
};

EventEmitter.prototype.emit = function(type) {
	var er, handler, len, args, i, listeners;

	if (!this._events) { this._events = {}; }

	// If there is no 'error' event listener then throw.
	if (type === "error") {
		if (!this._events.error || (isObject(this._events.error) && !this._events.error.length)) {
			er = arguments[1];
			if (er instanceof Error) { throw er; }
			throw TypeError("Uncaught, unspecified \"error\" event.");
		}
	}

	handler = this._events[type];

	if (isUndefined(handler)) { return false; }

	if (isFunction(handler)) {
		switch (arguments.length) {
			// fast cases
			case 1:
				handler.call(this);
				break;
			case 2:
				handler.call(this, arguments[1]);
				break;
			case 3:
				handler.call(this, arguments[1], arguments[2]);
				break;
				// slower
			default:
				args = Array.prototype.slice.call(arguments, 1);
				handler.apply(this, args);
		}
	} else if (isObject(handler)) {
		args = Array.prototype.slice.call(arguments, 1);
		listeners = handler.slice();
		len = listeners.length;
		for (i = 0; i < len; i++) { listeners[i].apply(this, args); }
	}

	return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
	var m;

	if (!isFunction(listener)) { throw TypeError("listener must be a function"); }

	if (!this._events) { this._events = {}; }

	// To avoid recursion in the case that type === "newListener"! Before
	// adding it to the listeners, first emit "newListener".
	if (this._events.newListener) {
		this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener);
	}

	// Optimize the case of one listener. Don't need the extra array object.
	if (!this._events[type]) { this._events[type] = listener; }
	// If we've already got an array, just append.
	else if (isObject(this._events[type])) { this._events[type].push(listener); }
	// Adding the second element, need to change to array.
	else { this._events[type] = [this._events[type], listener]; }

	// Check for listener leak
	if (isObject(this._events[type]) && !this._events[type].warned) {
		if (!isUndefined(this._maxListeners)) {
			m = this._maxListeners;
		} else {
			m = EventEmitter.defaultMaxListeners;
		}

		if (m && m > 0 && this._events[type].length > m) {
			this._events[type].warned = true;
			console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[type].length);
			// Not supported in IE 10
			if (typeof console.trace === "function") {
				console.trace();
			}
		}
	}

	return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

// Modified to support multiple calls..
EventEmitter.prototype.once = function(type, listener) {
	if (!isFunction(listener)) { throw TypeError("listener must be a function"); }

	var fired = false;

	if (this._events.hasOwnProperty(type) && type.charAt(0) === "_") {
		var count = 1;
		var searchFor = type;

		for (var k in this._events){
			if (this._events.hasOwnProperty(k) && k.startsWith(searchFor)) {
				count++;
			}
		}
		type = type + count;
	}

	function g() {
		if (type.charAt(0) === "_" && !isNaN(type.substr(type.length - 1))) {
			type = type.substring(0, type.length - 1);
		}
		this.removeListener(type, g);

		if (!fired) {
			fired = true;
			listener.apply(this, arguments);
		}
	}

	g.listener = listener;
	this.on(type, g);

	return this;
};

// Emits a "removeListener" event if the listener was removed..
// Modified to support multiple calls from .once()..
EventEmitter.prototype.removeListener = function(type, listener) {
	var list, position, length, i;

	if (!isFunction(listener)) { throw TypeError("listener must be a function"); }

	if (!this._events || !this._events[type]) { return this; }

	list = this._events[type];
	length = list.length;
	position = -1;
	if (list === listener || (isFunction(list.listener) && list.listener === listener)) {
		delete this._events[type];

		if (this._events.hasOwnProperty(type + "2") && type.charAt(0) === "_") {
			var searchFor = type;
			for (var k in this._events){
				if (this._events.hasOwnProperty(k) && k.startsWith(searchFor)) {
					if (!isNaN(parseInt(k.substr(k.length - 1)))) {
						this._events[type + parseInt(k.substr(k.length - 1) - 1)] = this._events[k];
						delete this._events[k];
					}
				}
			}

			this._events[type] = this._events[type + "1"];
			delete this._events[type + "1"];
		}
		if (this._events.removeListener) { this.emit("removeListener", type, listener); }
	}
	else if (isObject(list)) {
		for (i = length; i-- > 0;) {
			if (list[i] === listener ||
				(list[i].listener && list[i].listener === listener)) {
				position = i;
				break;
			}
		}

		if (position < 0) { return this; }

		if (list.length === 1) {
			list.length = 0;
			delete this._events[type];
		}
		else { list.splice(position, 1); }

		if (this._events.removeListener) { this.emit("removeListener", type, listener); }
	}

	return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
	var key, listeners;

	if (!this._events) { return this; }

	// not listening for removeListener, no need to emit
	if (!this._events.removeListener) {
		if (arguments.length === 0) { this._events = {}; }
		else if (this._events[type]) { delete this._events[type]; }
		return this;
	}

	// emit removeListener for all listeners on all events
	if (arguments.length === 0) {
		for (key in this._events) {
			if (key === "removeListener") { continue; }
			this.removeAllListeners(key);
		}
		this.removeAllListeners("removeListener");
		this._events = {};
		return this;
	}

	listeners = this._events[type];

	if (isFunction(listeners)) { this.removeListener(type, listeners); }
	else if (listeners) { while (listeners.length) { this.removeListener(type, listeners[listeners.length - 1]); } }
	delete this._events[type];

	return this;
};

EventEmitter.prototype.listeners = function(type) {
	var ret;
	if (!this._events || !this._events[type]) { ret = []; }
	else if (isFunction(this._events[type])) { ret = [this._events[type]]; }
	else { ret = this._events[type].slice(); }
	return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
	if (this._events) {
		var evlistener = this._events[type];

		if (isFunction(evlistener)) { return 1; }
		else if (evlistener) { return evlistener.length; }
	}
	return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
	return emitter.listenerCount(type);
};

function isFunction(arg) {
	return typeof arg === "function";
}

function isNumber(arg) {
	return typeof arg === "number";
}

function isObject(arg) {
	return typeof arg === "object" && arg !== null;
}

function isUndefined(arg) {
	return arg === void 0;
}


/***/ }),

/***/ 295:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const _ = __nccwpck_require__(658);

let currentLevel = 'info';
const levels = { 'trace': 0, 'debug': 1, 'info': 2, 'warn': 3, 'error': 4, 'fatal': 5 };

// Logger implementation..
function log(level) {
	// Return a console message depending on the logging level..
	return function(message) {
		if(levels[level] >= levels[currentLevel]) {
			console.log(`[${_.formatDate(new Date())}] ${level}: ${message}`);
		}
	};
}

module.exports = {
	// Change the current logging level..
	setLevel(level) {
		currentLevel = level;
	},
	trace: log('trace'),
	debug: log('debug'),
	info: log('info'),
	warn: log('warn'),
	error: log('error'),
	fatal: log('fatal')
};


/***/ }),

/***/ 668:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/*
	Copyright (c) 2013-2015, Fionn Kelleher All rights reserved.

	Redistribution and use in source and binary forms, with or without modification,
	are permitted provided that the following conditions are met:

		Redistributions of source code must retain the above copyright notice,
		this list of conditions and the following disclaimer.

		Redistributions in binary form must reproduce the above copyright notice,
		this list of conditions and the following disclaimer in the documentation and/or other materials
		provided with the distribution.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
	IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
	INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
	OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
	WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
	ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
	OF SUCH DAMAGE.
*/
const _ = __nccwpck_require__(658);
const nonspaceRegex = /\S+/g;

function parseComplexTag(tags, tagKey, splA = ',', splB = '/', splC) {
	const raw = tags[tagKey];
	
	if(raw === undefined) {
		return tags;
	}

	const tagIsString = typeof raw === 'string';
	tags[tagKey + '-raw'] = tagIsString ? raw : null;

	if(raw === true) {
		tags[tagKey] = null;
		return tags;
	}

	tags[tagKey] = {};

	if(tagIsString) {
		const spl = raw.split(splA);

		for (let i = 0; i < spl.length; i++) {
			const parts = spl[i].split(splB);
			let val = parts[1];
			if(splC !== undefined && val) {
				val = val.split(splC);
			}
			tags[tagKey][parts[0]] = val || null;
		}
	}
	return tags;
}

module.exports = {
	// Parse Twitch badges..
	badges(tags) {
		return parseComplexTag(tags, 'badges');
	},

	// Parse Twitch badge-info..
	badgeInfo(tags) {
		return parseComplexTag(tags, 'badge-info');
	},

	// Parse Twitch emotes..
	emotes(tags) {
		return parseComplexTag(tags, 'emotes', '/', ':', ',');
	},

	// Parse regex emotes..
	emoteRegex(msg, code, id, obj) {
		nonspaceRegex.lastIndex = 0;
		const regex = new RegExp('(\\b|^|\\s)' + _.unescapeHtml(code) + '(\\b|$|\\s)');
		let match;

		// Check if emote code matches using RegExp and push it to the object..
		while ((match = nonspaceRegex.exec(msg)) !== null) {
			if(regex.test(match[0])) {
				obj[id] = obj[id] || [];
				obj[id].push([ match.index, nonspaceRegex.lastIndex - 1 ]);
			}
		}
	},

	// Parse string emotes..
	emoteString(msg, code, id, obj) {
		nonspaceRegex.lastIndex = 0;
		let match;

		// Check if emote code matches and push it to the object..
		while ((match = nonspaceRegex.exec(msg)) !== null) {
			if(match[0] === _.unescapeHtml(code)) {
				obj[id] = obj[id] || [];
				obj[id].push([ match.index, nonspaceRegex.lastIndex - 1 ]);
			}
		}
	},

	// Transform the emotes object to a string with the following format..
	// emote_id:first_index-last_index,another_first-another_last/another_emote_id:first_index-last_index
	transformEmotes(emotes) {
		let transformed = '';

		Object.keys(emotes).forEach(id => {
			transformed = `${transformed+id}:`;
			emotes[id].forEach(
				index => transformed = `${transformed+index.join('-')},`
			);
			transformed = `${transformed.slice(0, -1)}/`;
		});
		return transformed.slice(0, -1);
	},

	formTags(tags) {
		const result = [];
		for(const key in tags) {
			const value = _.escapeIRC(tags[key]);
			result.push(`${key}=${value}`);
		}
		return `@${result.join(';')}`;
	},

	// Parse Twitch messages..
	msg(data) {
		const message = {
			raw: data,
			tags: {},
			prefix: null,
			command: null,
			params: []
		};

		// Position and nextspace are used by the parser as a reference..
		let position = 0;
		let nextspace = 0;

		// The first thing we check for is IRCv3.2 message tags.
		// http://ircv3.atheme.org/specification/message-tags-3.2
		if(data.charCodeAt(0) === 64) {
			nextspace = data.indexOf(' ');

			// Malformed IRC message..
			if(nextspace === -1) {
				return null;
			}

			// Tags are split by a semi colon..
			const rawTags = data.slice(1, nextspace).split(';');

			for (let i = 0; i < rawTags.length; i++) {
				// Tags delimited by an equals sign are key=value tags.
				// If there's no equals, we assign the tag a value of true.
				const tag = rawTags[i];
				const pair = tag.split('=');
				message.tags[pair[0]] = tag.substring(tag.indexOf('=') + 1) || true;
			}

			position = nextspace + 1;
		}

		// Skip any trailing whitespace..
		while (data.charCodeAt(position) === 32) {
			position++;
		}

		// Extract the message's prefix if present. Prefixes are prepended with a colon..
		if(data.charCodeAt(position) === 58) {
			nextspace = data.indexOf(' ', position);

			// If there's nothing after the prefix, deem this message to be malformed.
			if(nextspace === -1) {
				return null;
			}

			message.prefix = data.slice(position + 1, nextspace);
			position = nextspace + 1;

			// Skip any trailing whitespace..
			while (data.charCodeAt(position) === 32) {
				position++;
			}
		}

		nextspace = data.indexOf(' ', position);

		// If there's no more whitespace left, extract everything from the
		// current position to the end of the string as the command..
		if(nextspace === -1) {
			if(data.length > position) {
				message.command = data.slice(position);
				return message;
			}
			return null;
		}

		// Else, the command is the current position up to the next space. After
		// that, we expect some parameters.
		message.command = data.slice(position, nextspace);

		position = nextspace + 1;

		// Skip any trailing whitespace..
		while (data.charCodeAt(position) === 32) {
			position++;
		}

		while (position < data.length) {
			nextspace = data.indexOf(' ', position);

			// If the character is a colon, we've got a trailing parameter.
			// At this point, there are no extra params, so we push everything
			// from after the colon to the end of the string, to the params array
			// and break out of the loop.
			if(data.charCodeAt(position) === 58) {
				message.params.push(data.slice(position + 1));
				break;
			}

			// If we still have some whitespace...
			if(nextspace !== -1) {
				// Push whatever's between the current position and the next
				// space to the params array.
				message.params.push(data.slice(position, nextspace));
				position = nextspace + 1;

				// Skip any trailing whitespace and continue looping.
				while (data.charCodeAt(position) === 32) {
					position++;
				}

				continue;
			}

			// If we don't have any more whitespace and the param isn't trailing,
			// push everything remaining to the params array.
			if(nextspace === -1) {
				message.params.push(data.slice(position));
				break;
			}
		}
		return message;
	}
};


/***/ }),

/***/ 569:
/***/ ((module) => {

// Initialize the queue with a specific delay..
class Queue {
	constructor(defaultDelay) {
		this.queue = [];
		this.index = 0;
		this.defaultDelay = defaultDelay === undefined ? 3000 : defaultDelay;
	}
	// Add a new function to the queue..
	add(fn, delay) {
		this.queue.push({ fn, delay });
	}
	// Go to the next in queue..
	next() {
		const i = this.index++;
		const at = this.queue[i];
		if(!at) {
			return;
		}
		const next = this.queue[this.index];
		at.fn();
		if(next) {
			const delay = next.delay === undefined ? this.defaultDelay : next.delay;
			setTimeout(() => this.next(), delay);
		}
	}
}

module.exports = Queue;


/***/ }),

/***/ 658:
/***/ ((module) => {

// eslint-disable-next-line no-control-regex
const actionMessageRegex = /^\u0001ACTION ([^\u0001]+)\u0001$/;
const justinFanRegex = /^(justinfan)(\d+$)/;
const unescapeIRCRegex = /\\([sn:r\\])/g;
const escapeIRCRegex = /([ \n;\r\\])/g;
const ircEscapedChars = { s: ' ', n: '', ':': ';', r: '' };
const ircUnescapedChars = { ' ': 's', '\n': 'n', ';': ':', '\r': 'r' };
const _ = module.exports = {
	// Return the second value if the first value is undefined..
	get: (a, b) => typeof a === 'undefined' ? b : a,

	// Indirectly use hasOwnProperty
	hasOwn: (obj, key) => ({}).hasOwnProperty.call(obj, key),

	// Race a promise against a delay..
	promiseDelay: time => new Promise(resolve => setTimeout(resolve, time)),

	// Value is a finite number..
	isFinite: int => isFinite(int) && !isNaN(parseFloat(int)),

	// Parse string to number. Returns NaN if string can't be parsed to number..
	toNumber: (num, precision) => {
		if(num === null) {
			return 0;
		}
		const factor = Math.pow(10, _.isFinite(precision) ? precision : 0);
		return Math.round(num * factor) / factor;
	},

	// Value is an integer..
	isInteger: int => !isNaN(_.toNumber(int, 0)),

	// Merge two arrays..
	union: (a, b) => [ ...new Set([ ...a, ...b ]) ],

	// Value is a regex..
	isRegex: str => /[|\\^$*+?:#]/.test(str),

	// Value is a valid url..
	isURL: str => new RegExp('^(?:(?:https?|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?!(?:10|127)(?:\\.\\d{1,3}){3})(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))\\.?)(?::\\d{2,5})?(?:[/?#]\\S*)?$', 'i').test(str),

	// Return a random justinfan username..
	justinfan: () => `justinfan${Math.floor((Math.random() * 80000) + 1000)}`,

	// Username is a justinfan username..
	isJustinfan: username => justinFanRegex.test(username),

	// Return a valid channel name..
	channel: str => {
		const channel = (str ? str : '').toLowerCase();
		return channel[0] === '#' ? channel : '#' + channel;
	},

	// Return a valid username..
	username: str => {
		const username = (str ? str : '').toLowerCase();
		return username[0] === '#' ? username.slice(1) : username;
	},

	// Return a valid token..
	token: str => str ? str.toLowerCase().replace('oauth:', '') : '',

	// Return a valid password..
	password: str => {
		const token = _.token(str);
		return token ? `oauth:${token}` : '';
	},

	actionMessage: msg => msg.match(actionMessageRegex),

	// Replace all occurences of a string using an object..
	replaceAll: (str, obj) => {
		if(str === null || typeof str === 'undefined') {
			return null;
		}
		for (const x in obj) {
			str = str.replace(new RegExp(x, 'g'), obj[x]);
		}
		return str;
	},

	unescapeHtml: safe =>
		safe.replace(/\\&amp\\;/g, '&')
		.replace(/\\&lt\\;/g, '<')
		.replace(/\\&gt\\;/g, '>')
		.replace(/\\&quot\\;/g, '"')
		.replace(/\\&#039\\;/g, '\''),

	// Escaping values:
	// http://ircv3.net/specs/core/message-tags-3.2.html#escaping-values
	unescapeIRC: msg => {
		if(!msg || typeof msg !== 'string' || !msg.includes('\\')) {
			return msg;
		}
		return msg.replace(
			unescapeIRCRegex,
			(m, p) => p in ircEscapedChars ? ircEscapedChars[p] : p
		);
	},
	
	escapeIRC: msg => {
		if(!msg || typeof msg !== 'string') {
			return msg;
		}
		return msg.replace(
			escapeIRCRegex,
			(m, p) => p in ircUnescapedChars ? `\\${ircUnescapedChars[p]}` : p
		);
	},

	// Add word to a string..
	addWord: (line, word) => line.length ? line + ' ' + word : line + word,

	// Split a line but try not to cut a word in half..
	splitLine: (input, length) => {
		let lastSpace = input.substring(0, length).lastIndexOf(' ');
		// No spaces found, split at the very end to avoid a loop..
		if(lastSpace === -1) {
			lastSpace = length - 1;
		}
		return [ input.substring(0, lastSpace), input.substring(lastSpace + 1) ];
	},

	// Extract a number from a string..
	extractNumber: str => {
		const parts = str.split(' ');
		for (let i = 0; i < parts.length; i++) {
			if(_.isInteger(parts[i])) {
				return ~~parts[i];
			}
		}
		return 0;
	},

	// Format the date..
	formatDate: date => {
		let hours = date.getHours();
		let mins  = date.getMinutes();

		hours = (hours < 10 ? '0' : '') + hours;
		mins = (mins < 10 ? '0' : '') + mins;
		return `${hours}:${mins}`;
	},

	// Inherit the prototype methods from one constructor into another..
	inherits: (ctor, superCtor) => {
		ctor.super_ = superCtor;
		const TempCtor = function () {};
		TempCtor.prototype = superCtor.prototype;
		ctor.prototype = new TempCtor();
		ctor.prototype.constructor = ctor;
	},

	// Return whether inside a Node application or not..
	isNode: () => {
		try {
			return typeof process === 'object' &&
				Object.prototype.toString.call(process) === '[object process]';
		} catch(e) {}
		return false;
	}
};


/***/ }),

/***/ 713:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const WebSocket = __nccwpck_require__(784);

WebSocket.createWebSocketStream = __nccwpck_require__(787);
WebSocket.Server = __nccwpck_require__(695);
WebSocket.Receiver = __nccwpck_require__(706);
WebSocket.Sender = __nccwpck_require__(479);

module.exports = WebSocket;


/***/ }),

/***/ 366:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const { EMPTY_BUFFER } = __nccwpck_require__(89);

/**
 * Merges an array of buffers into a new buffer.
 *
 * @param {Buffer[]} list The array of buffers to concat
 * @param {Number} totalLength The total length of buffers in the list
 * @return {Buffer} The resulting buffer
 * @public
 */
function concat(list, totalLength) {
  if (list.length === 0) return EMPTY_BUFFER;
  if (list.length === 1) return list[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (let i = 0; i < list.length; i++) {
    const buf = list[i];
    target.set(buf, offset);
    offset += buf.length;
  }

  if (offset < totalLength) return target.slice(0, offset);

  return target;
}

/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 * @public
 */
function _mask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 * @public
 */
function _unmask(buffer, mask) {
  // Required until https://github.com/nodejs/node/issues/9006 is resolved.
  const length = buffer.length;
  for (let i = 0; i < length; i++) {
    buffer[i] ^= mask[i & 3];
  }
}

/**
 * Converts a buffer to an `ArrayBuffer`.
 *
 * @param {Buffer} buf The buffer to convert
 * @return {ArrayBuffer} Converted buffer
 * @public
 */
function toArrayBuffer(buf) {
  if (buf.byteLength === buf.buffer.byteLength) {
    return buf.buffer;
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

/**
 * Converts `data` to a `Buffer`.
 *
 * @param {*} data The data to convert
 * @return {Buffer} The buffer
 * @throws {TypeError}
 * @public
 */
function toBuffer(data) {
  toBuffer.readOnly = true;

  if (Buffer.isBuffer(data)) return data;

  let buf;

  if (data instanceof ArrayBuffer) {
    buf = Buffer.from(data);
  } else if (ArrayBuffer.isView(data)) {
    buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  } else {
    buf = Buffer.from(data);
    toBuffer.readOnly = false;
  }

  return buf;
}

try {
  const bufferUtil = __nccwpck_require__(709);
  const bu = bufferUtil.BufferUtil || bufferUtil;

  module.exports = {
    concat,
    mask(source, mask, output, offset, length) {
      if (length < 48) _mask(source, mask, output, offset, length);
      else bu.mask(source, mask, output, offset, length);
    },
    toArrayBuffer,
    toBuffer,
    unmask(buffer, mask) {
      if (buffer.length < 32) _unmask(buffer, mask);
      else bu.unmask(buffer, mask);
    }
  };
} catch (e) /* istanbul ignore next */ {
  module.exports = {
    concat,
    mask: _mask,
    toArrayBuffer,
    toBuffer,
    unmask: _unmask
  };
}


/***/ }),

/***/ 89:
/***/ ((module) => {

"use strict";


module.exports = {
  BINARY_TYPES: ['nodebuffer', 'arraybuffer', 'fragments'],
  GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
  kStatusCode: Symbol('status-code'),
  kWebSocket: Symbol('websocket'),
  EMPTY_BUFFER: Buffer.alloc(0),
  NOOP: () => {}
};


/***/ }),

/***/ 447:
/***/ ((module) => {

"use strict";


/**
 * Class representing an event.
 *
 * @private
 */
class Event {
  /**
   * Create a new `Event`.
   *
   * @param {String} type The name of the event
   * @param {Object} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(type, target) {
    this.target = target;
    this.type = type;
  }
}

/**
 * Class representing a message event.
 *
 * @extends Event
 * @private
 */
class MessageEvent extends Event {
  /**
   * Create a new `MessageEvent`.
   *
   * @param {(String|Buffer|ArrayBuffer|Buffer[])} data The received data
   * @param {WebSocket} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(data, target) {
    super('message', target);

    this.data = data;
  }
}

/**
 * Class representing a close event.
 *
 * @extends Event
 * @private
 */
class CloseEvent extends Event {
  /**
   * Create a new `CloseEvent`.
   *
   * @param {Number} code The status code explaining why the connection is being
   *     closed
   * @param {String} reason A human-readable string explaining why the
   *     connection is closing
   * @param {WebSocket} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(code, reason, target) {
    super('close', target);

    this.wasClean = target._closeFrameReceived && target._closeFrameSent;
    this.reason = reason;
    this.code = code;
  }
}

/**
 * Class representing an open event.
 *
 * @extends Event
 * @private
 */
class OpenEvent extends Event {
  /**
   * Create a new `OpenEvent`.
   *
   * @param {WebSocket} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(target) {
    super('open', target);
  }
}

/**
 * Class representing an error event.
 *
 * @extends Event
 * @private
 */
class ErrorEvent extends Event {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param {Object} error The error that generated this event
   * @param {WebSocket} target A reference to the target to which the event was
   *     dispatched
   */
  constructor(error, target) {
    super('error', target);

    this.message = error.message;
    this.error = error;
  }
}

/**
 * This provides methods for emulating the `EventTarget` interface. It's not
 * meant to be used directly.
 *
 * @mixin
 */
const EventTarget = {
  /**
   * Register an event listener.
   *
   * @param {String} type A string representing the event type to listen for
   * @param {Function} listener The listener to add
   * @param {Object} [options] An options object specifies characteristics about
   *     the event listener
   * @param {Boolean} [options.once=false] A `Boolean`` indicating that the
   *     listener should be invoked at most once after being added. If `true`,
   *     the listener would be automatically removed when invoked.
   * @public
   */
  addEventListener(type, listener, options) {
    if (typeof listener !== 'function') return;

    function onMessage(data) {
      listener.call(this, new MessageEvent(data, this));
    }

    function onClose(code, message) {
      listener.call(this, new CloseEvent(code, message, this));
    }

    function onError(error) {
      listener.call(this, new ErrorEvent(error, this));
    }

    function onOpen() {
      listener.call(this, new OpenEvent(this));
    }

    const method = options && options.once ? 'once' : 'on';

    if (type === 'message') {
      onMessage._listener = listener;
      this[method](type, onMessage);
    } else if (type === 'close') {
      onClose._listener = listener;
      this[method](type, onClose);
    } else if (type === 'error') {
      onError._listener = listener;
      this[method](type, onError);
    } else if (type === 'open') {
      onOpen._listener = listener;
      this[method](type, onOpen);
    } else {
      this[method](type, listener);
    }
  },

  /**
   * Remove an event listener.
   *
   * @param {String} type A string representing the event type to remove
   * @param {Function} listener The listener to remove
   * @public
   */
  removeEventListener(type, listener) {
    const listeners = this.listeners(type);

    for (let i = 0; i < listeners.length; i++) {
      if (listeners[i] === listener || listeners[i]._listener === listener) {
        this.removeListener(type, listeners[i]);
      }
    }
  }
};

module.exports = EventTarget;


/***/ }),

/***/ 22:
/***/ ((module) => {

"use strict";


//
// Allowed token characters:
//
// '!', '#', '$', '%', '&', ''', '*', '+', '-',
// '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'
//
// tokenChars[32] === 0 // ' '
// tokenChars[33] === 1 // '!'
// tokenChars[34] === 0 // '"'
// ...
//
// prettier-ignore
const tokenChars = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127
];

/**
 * Adds an offer to the map of extension offers or a parameter to the map of
 * parameters.
 *
 * @param {Object} dest The map of extension offers or parameters
 * @param {String} name The extension or parameter name
 * @param {(Object|Boolean|String)} elem The extension parameters or the
 *     parameter value
 * @private
 */
function push(dest, name, elem) {
  if (dest[name] === undefined) dest[name] = [elem];
  else dest[name].push(elem);
}

/**
 * Parses the `Sec-WebSocket-Extensions` header into an object.
 *
 * @param {String} header The field value of the header
 * @return {Object} The parsed object
 * @public
 */
function parse(header) {
  const offers = Object.create(null);

  if (header === undefined || header === '') return offers;

  let params = Object.create(null);
  let mustUnescape = false;
  let isEscaping = false;
  let inQuotes = false;
  let extensionName;
  let paramName;
  let start = -1;
  let end = -1;
  let i = 0;

  for (; i < header.length; i++) {
    const code = header.charCodeAt(i);

    if (extensionName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 /* ' ' */ || code === 0x09 /* '\t' */) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b /* ';' */ || code === 0x2c /* ',' */) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        const name = header.slice(start, end);
        if (code === 0x2c) {
          push(offers, name, params);
          params = Object.create(null);
        } else {
          extensionName = name;
        }

        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else if (paramName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        push(params, header.slice(start, end), true);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        start = end = -1;
      } else if (code === 0x3d /* '=' */ && start !== -1 && end === -1) {
        paramName = header.slice(start, i);
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else {
      //
      // The value of a quoted-string after unescaping must conform to the
      // token ABNF, so only token characters are valid.
      // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
      //
      if (isEscaping) {
        if (tokenChars[code] !== 1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (start === -1) start = i;
        else if (!mustUnescape) mustUnescape = true;
        isEscaping = false;
      } else if (inQuotes) {
        if (tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 0x22 /* '"' */ && start !== -1) {
          inQuotes = false;
          end = i;
        } else if (code === 0x5c /* '\' */) {
          isEscaping = true;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
        inQuotes = true;
      } else if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
        if (end === -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        let value = header.slice(start, end);
        if (mustUnescape) {
          value = value.replace(/\\/g, '');
          mustUnescape = false;
        }
        push(params, paramName, value);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        paramName = undefined;
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    }
  }

  if (start === -1 || inQuotes) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = i;
  const token = header.slice(start, end);
  if (extensionName === undefined) {
    push(offers, token, params);
  } else {
    if (paramName === undefined) {
      push(params, token, true);
    } else if (mustUnescape) {
      push(params, paramName, token.replace(/\\/g, ''));
    } else {
      push(params, paramName, token);
    }
    push(offers, extensionName, params);
  }

  return offers;
}

/**
 * Builds the `Sec-WebSocket-Extensions` header field value.
 *
 * @param {Object} extensions The map of extensions and parameters to format
 * @return {String} A string representing the given object
 * @public
 */
function format(extensions) {
  return Object.keys(extensions)
    .map((extension) => {
      let configurations = extensions[extension];
      if (!Array.isArray(configurations)) configurations = [configurations];
      return configurations
        .map((params) => {
          return [extension]
            .concat(
              Object.keys(params).map((k) => {
                let values = params[k];
                if (!Array.isArray(values)) values = [values];
                return values
                  .map((v) => (v === true ? k : `${k}=${v}`))
                  .join('; ');
              })
            )
            .join('; ');
        })
        .join(', ');
    })
    .join(', ');
}

module.exports = { format, parse };


/***/ }),

/***/ 193:
/***/ ((module) => {

"use strict";


const kDone = Symbol('kDone');
const kRun = Symbol('kRun');

/**
 * A very simple job queue with adjustable concurrency. Adapted from
 * https://github.com/STRML/async-limiter
 */
class Limiter {
  /**
   * Creates a new `Limiter`.
   *
   * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
   *     to run concurrently
   */
  constructor(concurrency) {
    this[kDone] = () => {
      this.pending--;
      this[kRun]();
    };
    this.concurrency = concurrency || Infinity;
    this.jobs = [];
    this.pending = 0;
  }

  /**
   * Adds a job to the queue.
   *
   * @param {Function} job The job to run
   * @public
   */
  add(job) {
    this.jobs.push(job);
    this[kRun]();
  }

  /**
   * Removes a job from the queue and runs it if possible.
   *
   * @private
   */
  [kRun]() {
    if (this.pending === this.concurrency) return;

    if (this.jobs.length) {
      const job = this.jobs.shift();

      this.pending++;
      job(this[kDone]);
    }
  }
}

module.exports = Limiter;


/***/ }),

/***/ 458:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const zlib = __nccwpck_require__(761);

const bufferUtil = __nccwpck_require__(366);
const Limiter = __nccwpck_require__(193);
const { kStatusCode, NOOP } = __nccwpck_require__(89);

const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const kPerMessageDeflate = Symbol('permessage-deflate');
const kTotalLength = Symbol('total-length');
const kCallback = Symbol('callback');
const kBuffers = Symbol('buffers');
const kError = Symbol('error');

//
// We limit zlib concurrency, which prevents severe memory fragmentation
// as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913
// and https://github.com/websockets/ws/issues/1202
//
// Intentionally global; it's the global thread pool that's an issue.
//
let zlibLimiter;

/**
 * permessage-deflate implementation.
 */
class PerMessageDeflate {
  /**
   * Creates a PerMessageDeflate instance.
   *
   * @param {Object} [options] Configuration options
   * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
   *     disabling of server context takeover
   * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
   *     acknowledge disabling of client context takeover
   * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
   *     use of a custom server window size
   * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
   *     for, or request, a custom client window size
   * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
   *     deflate
   * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
   *     inflate
   * @param {Number} [options.threshold=1024] Size (in bytes) below which
   *     messages should not be compressed
   * @param {Number} [options.concurrencyLimit=10] The number of concurrent
   *     calls to zlib
   * @param {Boolean} [isServer=false] Create the instance in either server or
   *     client mode
   * @param {Number} [maxPayload=0] The maximum allowed message length
   */
  constructor(options, isServer, maxPayload) {
    this._maxPayload = maxPayload | 0;
    this._options = options || {};
    this._threshold =
      this._options.threshold !== undefined ? this._options.threshold : 1024;
    this._isServer = !!isServer;
    this._deflate = null;
    this._inflate = null;

    this.params = null;

    if (!zlibLimiter) {
      const concurrency =
        this._options.concurrencyLimit !== undefined
          ? this._options.concurrencyLimit
          : 10;
      zlibLimiter = new Limiter(concurrency);
    }
  }

  /**
   * @type {String}
   */
  static get extensionName() {
    return 'permessage-deflate';
  }

  /**
   * Create an extension negotiation offer.
   *
   * @return {Object} Extension parameters
   * @public
   */
  offer() {
    const params = {};

    if (this._options.serverNoContextTakeover) {
      params.server_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover) {
      params.client_no_context_takeover = true;
    }
    if (this._options.serverMaxWindowBits) {
      params.server_max_window_bits = this._options.serverMaxWindowBits;
    }
    if (this._options.clientMaxWindowBits) {
      params.client_max_window_bits = this._options.clientMaxWindowBits;
    } else if (this._options.clientMaxWindowBits == null) {
      params.client_max_window_bits = true;
    }

    return params;
  }

  /**
   * Accept an extension negotiation offer/response.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Object} Accepted configuration
   * @public
   */
  accept(configurations) {
    configurations = this.normalizeParams(configurations);

    this.params = this._isServer
      ? this.acceptAsServer(configurations)
      : this.acceptAsClient(configurations);

    return this.params;
  }

  /**
   * Releases all resources used by the extension.
   *
   * @public
   */
  cleanup() {
    if (this._inflate) {
      this._inflate.close();
      this._inflate = null;
    }

    if (this._deflate) {
      const callback = this._deflate[kCallback];

      this._deflate.close();
      this._deflate = null;

      if (callback) {
        callback(
          new Error(
            'The deflate stream was closed while data was being processed'
          )
        );
      }
    }
  }

  /**
   *  Accept an extension negotiation offer.
   *
   * @param {Array} offers The extension negotiation offers
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsServer(offers) {
    const opts = this._options;
    const accepted = offers.find((params) => {
      if (
        (opts.serverNoContextTakeover === false &&
          params.server_no_context_takeover) ||
        (params.server_max_window_bits &&
          (opts.serverMaxWindowBits === false ||
            (typeof opts.serverMaxWindowBits === 'number' &&
              opts.serverMaxWindowBits > params.server_max_window_bits))) ||
        (typeof opts.clientMaxWindowBits === 'number' &&
          !params.client_max_window_bits)
      ) {
        return false;
      }

      return true;
    });

    if (!accepted) {
      throw new Error('None of the extension offers can be accepted');
    }

    if (opts.serverNoContextTakeover) {
      accepted.server_no_context_takeover = true;
    }
    if (opts.clientNoContextTakeover) {
      accepted.client_no_context_takeover = true;
    }
    if (typeof opts.serverMaxWindowBits === 'number') {
      accepted.server_max_window_bits = opts.serverMaxWindowBits;
    }
    if (typeof opts.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = opts.clientMaxWindowBits;
    } else if (
      accepted.client_max_window_bits === true ||
      opts.clientMaxWindowBits === false
    ) {
      delete accepted.client_max_window_bits;
    }

    return accepted;
  }

  /**
   * Accept the extension negotiation response.
   *
   * @param {Array} response The extension negotiation response
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsClient(response) {
    const params = response[0];

    if (
      this._options.clientNoContextTakeover === false &&
      params.client_no_context_takeover
    ) {
      throw new Error('Unexpected parameter "client_no_context_takeover"');
    }

    if (!params.client_max_window_bits) {
      if (typeof this._options.clientMaxWindowBits === 'number') {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      }
    } else if (
      this._options.clientMaxWindowBits === false ||
      (typeof this._options.clientMaxWindowBits === 'number' &&
        params.client_max_window_bits > this._options.clientMaxWindowBits)
    ) {
      throw new Error(
        'Unexpected or invalid parameter "client_max_window_bits"'
      );
    }

    return params;
  }

  /**
   * Normalize parameters.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Array} The offers/response with normalized parameters
   * @private
   */
  normalizeParams(configurations) {
    configurations.forEach((params) => {
      Object.keys(params).forEach((key) => {
        let value = params[key];

        if (value.length > 1) {
          throw new Error(`Parameter "${key}" must have only a single value`);
        }

        value = value[0];

        if (key === 'client_max_window_bits') {
          if (value !== true) {
            const num = +value;
            if (!Number.isInteger(num) || num < 8 || num > 15) {
              throw new TypeError(
                `Invalid value for parameter "${key}": ${value}`
              );
            }
            value = num;
          } else if (!this._isServer) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else if (key === 'server_max_window_bits') {
          const num = +value;
          if (!Number.isInteger(num) || num < 8 || num > 15) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
          value = num;
        } else if (
          key === 'client_no_context_takeover' ||
          key === 'server_no_context_takeover'
        ) {
          if (value !== true) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else {
          throw new Error(`Unknown parameter "${key}"`);
        }

        params[key] = value;
      });
    });

    return configurations;
  }

  /**
   * Decompress data. Concurrency limited.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  decompress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._decompress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Compress data. Concurrency limited.
   *
   * @param {Buffer} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  compress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._compress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Decompress data.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _decompress(data, fin, callback) {
    const endpoint = this._isServer ? 'client' : 'server';

    if (!this._inflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._inflate = zlib.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits
      });
      this._inflate[kPerMessageDeflate] = this;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate.on('error', inflateOnError);
      this._inflate.on('data', inflateOnData);
    }

    this._inflate[kCallback] = callback;

    this._inflate.write(data);
    if (fin) this._inflate.write(TRAILER);

    this._inflate.flush(() => {
      const err = this._inflate[kError];

      if (err) {
        this._inflate.close();
        this._inflate = null;
        callback(err);
        return;
      }

      const data = bufferUtil.concat(
        this._inflate[kBuffers],
        this._inflate[kTotalLength]
      );

      if (this._inflate._readableState.endEmitted) {
        this._inflate.close();
        this._inflate = null;
      } else {
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];

        if (fin && this.params[`${endpoint}_no_context_takeover`]) {
          this._inflate.reset();
        }
      }

      callback(null, data);
    });
  }

  /**
   * Compress data.
   *
   * @param {Buffer} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _compress(data, fin, callback) {
    const endpoint = this._isServer ? 'server' : 'client';

    if (!this._deflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._deflate = zlib.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits
      });

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      //
      // An `'error'` event is emitted, only on Node.js < 10.0.0, if the
      // `zlib.DeflateRaw` instance is closed while data is being processed.
      // This can happen if `PerMessageDeflate#cleanup()` is called at the wrong
      // time due to an abnormal WebSocket closure.
      //
      this._deflate.on('error', NOOP);
      this._deflate.on('data', deflateOnData);
    }

    this._deflate[kCallback] = callback;

    this._deflate.write(data);
    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
      if (!this._deflate) {
        //
        // The deflate stream was closed while data was being processed.
        //
        return;
      }

      let data = bufferUtil.concat(
        this._deflate[kBuffers],
        this._deflate[kTotalLength]
      );

      if (fin) data = data.slice(0, data.length - 4);

      //
      // Ensure that the callback will not be called again in
      // `PerMessageDeflate#cleanup()`.
      //
      this._deflate[kCallback] = null;

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      if (fin && this.params[`${endpoint}_no_context_takeover`]) {
        this._deflate.reset();
      }

      callback(null, data);
    });
  }
}

module.exports = PerMessageDeflate;

/**
 * The listener of the `zlib.DeflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function deflateOnData(chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

/**
 * The listener of the `zlib.InflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function inflateOnData(chunk) {
  this[kTotalLength] += chunk.length;

  if (
    this[kPerMessageDeflate]._maxPayload < 1 ||
    this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload
  ) {
    this[kBuffers].push(chunk);
    return;
  }

  this[kError] = new RangeError('Max payload size exceeded');
  this[kError][kStatusCode] = 1009;
  this.removeListener('data', inflateOnData);
  this.reset();
}

/**
 * The listener of the `zlib.InflateRaw` stream `'error'` event.
 *
 * @param {Error} err The emitted error
 * @private
 */
function inflateOnError(err) {
  //
  // There is no need to call `Zlib#close()` as the handle is automatically
  // closed when an error is emitted.
  //
  this[kPerMessageDeflate]._inflate = null;
  err[kStatusCode] = 1007;
  this[kCallback](err);
}


/***/ }),

/***/ 706:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const { Writable } = __nccwpck_require__(413);

const PerMessageDeflate = __nccwpck_require__(458);
const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  kStatusCode,
  kWebSocket
} = __nccwpck_require__(89);
const { concat, toArrayBuffer, unmask } = __nccwpck_require__(366);
const { isValidStatusCode, isValidUTF8 } = __nccwpck_require__(653);

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;

/**
 * HyBi Receiver implementation.
 *
 * @extends stream.Writable
 */
class Receiver extends Writable {
  /**
   * Creates a Receiver instance.
   *
   * @param {String} [binaryType=nodebuffer] The type for binary data
   * @param {Object} [extensions] An object containing the negotiated extensions
   * @param {Boolean} [isServer=false] Specifies whether to operate in client or
   *     server mode
   * @param {Number} [maxPayload=0] The maximum allowed message length
   */
  constructor(binaryType, extensions, isServer, maxPayload) {
    super();

    this._binaryType = binaryType || BINARY_TYPES[0];
    this[kWebSocket] = undefined;
    this._extensions = extensions || {};
    this._isServer = !!isServer;
    this._maxPayload = maxPayload | 0;

    this._bufferedBytes = 0;
    this._buffers = [];

    this._compressed = false;
    this._payloadLength = 0;
    this._mask = undefined;
    this._fragmented = 0;
    this._masked = false;
    this._fin = false;
    this._opcode = 0;

    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragments = [];

    this._state = GET_INFO;
    this._loop = false;
  }

  /**
   * Implements `Writable.prototype._write()`.
   *
   * @param {Buffer} chunk The chunk of data to write
   * @param {String} encoding The character encoding of `chunk`
   * @param {Function} cb Callback
   * @private
   */
  _write(chunk, encoding, cb) {
    if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(cb);
  }

  /**
   * Consumes `n` bytes from the buffered data.
   *
   * @param {Number} n The number of bytes to consume
   * @return {Buffer} The consumed bytes
   * @private
   */
  consume(n) {
    this._bufferedBytes -= n;

    if (n === this._buffers[0].length) return this._buffers.shift();

    if (n < this._buffers[0].length) {
      const buf = this._buffers[0];
      this._buffers[0] = buf.slice(n);
      return buf.slice(0, n);
    }

    const dst = Buffer.allocUnsafe(n);

    do {
      const buf = this._buffers[0];
      const offset = dst.length - n;

      if (n >= buf.length) {
        dst.set(this._buffers.shift(), offset);
      } else {
        dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
        this._buffers[0] = buf.slice(n);
      }

      n -= buf.length;
    } while (n > 0);

    return dst;
  }

  /**
   * Starts the parsing loop.
   *
   * @param {Function} cb Callback
   * @private
   */
  startLoop(cb) {
    let err;
    this._loop = true;

    do {
      switch (this._state) {
        case GET_INFO:
          err = this.getInfo();
          break;
        case GET_PAYLOAD_LENGTH_16:
          err = this.getPayloadLength16();
          break;
        case GET_PAYLOAD_LENGTH_64:
          err = this.getPayloadLength64();
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          err = this.getData(cb);
          break;
        default:
          // `INFLATING`
          this._loop = false;
          return;
      }
    } while (this._loop);

    cb(err);
  }

  /**
   * Reads the first two bytes of a frame.
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getInfo() {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    const buf = this.consume(2);

    if ((buf[0] & 0x30) !== 0x00) {
      this._loop = false;
      return error(RangeError, 'RSV2 and RSV3 must be clear', true, 1002);
    }

    const compressed = (buf[0] & 0x40) === 0x40;

    if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
      this._loop = false;
      return error(RangeError, 'RSV1 must be clear', true, 1002);
    }

    this._fin = (buf[0] & 0x80) === 0x80;
    this._opcode = buf[0] & 0x0f;
    this._payloadLength = buf[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        this._loop = false;
        return error(RangeError, 'RSV1 must be clear', true, 1002);
      }

      if (!this._fragmented) {
        this._loop = false;
        return error(RangeError, 'invalid opcode 0', true, 1002);
      }

      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        this._loop = false;
        return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002);
      }

      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        this._loop = false;
        return error(RangeError, 'FIN must be set', true, 1002);
      }

      if (compressed) {
        this._loop = false;
        return error(RangeError, 'RSV1 must be clear', true, 1002);
      }

      if (this._payloadLength > 0x7d) {
        this._loop = false;
        return error(
          RangeError,
          `invalid payload length ${this._payloadLength}`,
          true,
          1002
        );
      }
    } else {
      this._loop = false;
      return error(RangeError, `invalid opcode ${this._opcode}`, true, 1002);
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
    this._masked = (buf[1] & 0x80) === 0x80;

    if (this._isServer) {
      if (!this._masked) {
        this._loop = false;
        return error(RangeError, 'MASK must be set', true, 1002);
      }
    } else if (this._masked) {
      this._loop = false;
      return error(RangeError, 'MASK must be clear', true, 1002);
    }

    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else return this.haveLength();
  }

  /**
   * Gets extended payload length (7+16).
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getPayloadLength16() {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    this._payloadLength = this.consume(2).readUInt16BE(0);
    return this.haveLength();
  }

  /**
   * Gets extended payload length (7+64).
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getPayloadLength64() {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }

    const buf = this.consume(8);
    const num = buf.readUInt32BE(0);

    //
    // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
    // if payload length is greater than this number.
    //
    if (num > Math.pow(2, 53 - 32) - 1) {
      this._loop = false;
      return error(
        RangeError,
        'Unsupported WebSocket frame: payload length > 2^53 - 1',
        false,
        1009
      );
    }

    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
    return this.haveLength();
  }

  /**
   * Payload length has been read.
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  haveLength() {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
        this._loop = false;
        return error(RangeError, 'Max payload size exceeded', false, 1009);
      }
    }

    if (this._masked) this._state = GET_MASK;
    else this._state = GET_DATA;
  }

  /**
   * Reads mask bytes.
   *
   * @private
   */
  getMask() {
    if (this._bufferedBytes < 4) {
      this._loop = false;
      return;
    }

    this._mask = this.consume(4);
    this._state = GET_DATA;
  }

  /**
   * Reads data bytes.
   *
   * @param {Function} cb Callback
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  getData(cb) {
    let data = EMPTY_BUFFER;

    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = false;
        return;
      }

      data = this.consume(this._payloadLength);
      if (this._masked) unmask(data, this._mask);
    }

    if (this._opcode > 0x07) return this.controlMessage(data);

    if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data, cb);
      return;
    }

    if (data.length) {
      //
      // This message is not compressed so its lenght is the sum of the payload
      // length of all fragments.
      //
      this._messageLength = this._totalPayloadLength;
      this._fragments.push(data);
    }

    return this.dataMessage();
  }

  /**
   * Decompresses data.
   *
   * @param {Buffer} data Compressed data
   * @param {Function} cb Callback
   * @private
   */
  decompress(data, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
      if (err) return cb(err);

      if (buf.length) {
        this._messageLength += buf.length;
        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
          return cb(
            error(RangeError, 'Max payload size exceeded', false, 1009)
          );
        }

        this._fragments.push(buf);
      }

      const er = this.dataMessage();
      if (er) return cb(er);

      this.startLoop(cb);
    });
  }

  /**
   * Handles a data message.
   *
   * @return {(Error|undefined)} A possible error
   * @private
   */
  dataMessage() {
    if (this._fin) {
      const messageLength = this._messageLength;
      const fragments = this._fragments;

      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragmented = 0;
      this._fragments = [];

      if (this._opcode === 2) {
        let data;

        if (this._binaryType === 'nodebuffer') {
          data = concat(fragments, messageLength);
        } else if (this._binaryType === 'arraybuffer') {
          data = toArrayBuffer(concat(fragments, messageLength));
        } else {
          data = fragments;
        }

        this.emit('message', data);
      } else {
        const buf = concat(fragments, messageLength);

        if (!isValidUTF8(buf)) {
          this._loop = false;
          return error(Error, 'invalid UTF-8 sequence', true, 1007);
        }

        this.emit('message', buf.toString());
      }
    }

    this._state = GET_INFO;
  }

  /**
   * Handles a control message.
   *
   * @param {Buffer} data Data to handle
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  controlMessage(data) {
    if (this._opcode === 0x08) {
      this._loop = false;

      if (data.length === 0) {
        this.emit('conclude', 1005, '');
        this.end();
      } else if (data.length === 1) {
        return error(RangeError, 'invalid payload length 1', true, 1002);
      } else {
        const code = data.readUInt16BE(0);

        if (!isValidStatusCode(code)) {
          return error(RangeError, `invalid status code ${code}`, true, 1002);
        }

        const buf = data.slice(2);

        if (!isValidUTF8(buf)) {
          return error(Error, 'invalid UTF-8 sequence', true, 1007);
        }

        this.emit('conclude', code, buf.toString());
        this.end();
      }
    } else if (this._opcode === 0x09) {
      this.emit('ping', data);
    } else {
      this.emit('pong', data);
    }

    this._state = GET_INFO;
  }
}

module.exports = Receiver;

/**
 * Builds an error object.
 *
 * @param {(Error|RangeError)} ErrorCtor The error constructor
 * @param {String} message The error message
 * @param {Boolean} prefix Specifies whether or not to add a default prefix to
 *     `message`
 * @param {Number} statusCode The status code
 * @return {(Error|RangeError)} The error
 * @private
 */
function error(ErrorCtor, message, prefix, statusCode) {
  const err = new ErrorCtor(
    prefix ? `Invalid WebSocket frame: ${message}` : message
  );

  Error.captureStackTrace(err, error);
  err[kStatusCode] = statusCode;
  return err;
}


/***/ }),

/***/ 479:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const { randomFillSync } = __nccwpck_require__(417);

const PerMessageDeflate = __nccwpck_require__(458);
const { EMPTY_BUFFER } = __nccwpck_require__(89);
const { isValidStatusCode } = __nccwpck_require__(653);
const { mask: applyMask, toBuffer } = __nccwpck_require__(366);

const mask = Buffer.alloc(4);

/**
 * HyBi Sender implementation.
 */
class Sender {
  /**
   * Creates a Sender instance.
   *
   * @param {net.Socket} socket The connection socket
   * @param {Object} [extensions] An object containing the negotiated extensions
   */
  constructor(socket, extensions) {
    this._extensions = extensions || {};
    this._socket = socket;

    this._firstFragment = true;
    this._compress = false;

    this._bufferedBytes = 0;
    this._deflating = false;
    this._queue = [];
  }

  /**
   * Frames a piece of data according to the HyBi WebSocket protocol.
   *
   * @param {Buffer} data The data to frame
   * @param {Object} options Options object
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @return {Buffer[]} The framed data as a list of `Buffer` instances
   * @public
   */
  static frame(data, options) {
    const merge = options.mask && options.readOnly;
    let offset = options.mask ? 6 : 2;
    let payloadLength = data.length;

    if (data.length >= 65536) {
      offset += 8;
      payloadLength = 127;
    } else if (data.length > 125) {
      offset += 2;
      payloadLength = 126;
    }

    const target = Buffer.allocUnsafe(merge ? data.length + offset : offset);

    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) target[0] |= 0x40;

    target[1] = payloadLength;

    if (payloadLength === 126) {
      target.writeUInt16BE(data.length, 2);
    } else if (payloadLength === 127) {
      target.writeUInt32BE(0, 2);
      target.writeUInt32BE(data.length, 6);
    }

    if (!options.mask) return [target, data];

    randomFillSync(mask, 0, 4);

    target[1] |= 0x80;
    target[offset - 4] = mask[0];
    target[offset - 3] = mask[1];
    target[offset - 2] = mask[2];
    target[offset - 1] = mask[3];

    if (merge) {
      applyMask(data, mask, target, offset, data.length);
      return [target];
    }

    applyMask(data, mask, data, 0, data.length);
    return [target, data];
  }

  /**
   * Sends a close message to the other peer.
   *
   * @param {Number} [code] The status code component of the body
   * @param {String} [data] The message component of the body
   * @param {Boolean} [mask=false] Specifies whether or not to mask the message
   * @param {Function} [cb] Callback
   * @public
   */
  close(code, data, mask, cb) {
    let buf;

    if (code === undefined) {
      buf = EMPTY_BUFFER;
    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
      throw new TypeError('First argument must be a valid error code number');
    } else if (data === undefined || data === '') {
      buf = Buffer.allocUnsafe(2);
      buf.writeUInt16BE(code, 0);
    } else {
      const length = Buffer.byteLength(data);

      if (length > 123) {
        throw new RangeError('The message must not be greater than 123 bytes');
      }

      buf = Buffer.allocUnsafe(2 + length);
      buf.writeUInt16BE(code, 0);
      buf.write(data, 2);
    }

    if (this._deflating) {
      this.enqueue([this.doClose, buf, mask, cb]);
    } else {
      this.doClose(buf, mask, cb);
    }
  }

  /**
   * Frames and sends a close message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @private
   */
  doClose(data, mask, cb) {
    this.sendFrame(
      Sender.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 0x08,
        mask,
        readOnly: false
      }),
      cb
    );
  }

  /**
   * Sends a ping message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  ping(data, mask, cb) {
    const buf = toBuffer(data);

    if (buf.length > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    if (this._deflating) {
      this.enqueue([this.doPing, buf, mask, toBuffer.readOnly, cb]);
    } else {
      this.doPing(buf, mask, toBuffer.readOnly, cb);
    }
  }

  /**
   * Frames and sends a ping message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Boolean} [readOnly=false] Specifies whether `data` can be modified
   * @param {Function} [cb] Callback
   * @private
   */
  doPing(data, mask, readOnly, cb) {
    this.sendFrame(
      Sender.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 0x09,
        mask,
        readOnly
      }),
      cb
    );
  }

  /**
   * Sends a pong message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  pong(data, mask, cb) {
    const buf = toBuffer(data);

    if (buf.length > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    if (this._deflating) {
      this.enqueue([this.doPong, buf, mask, toBuffer.readOnly, cb]);
    } else {
      this.doPong(buf, mask, toBuffer.readOnly, cb);
    }
  }

  /**
   * Frames and sends a pong message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Boolean} [readOnly=false] Specifies whether `data` can be modified
   * @param {Function} [cb] Callback
   * @private
   */
  doPong(data, mask, readOnly, cb) {
    this.sendFrame(
      Sender.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 0x0a,
        mask,
        readOnly
      }),
      cb
    );
  }

  /**
   * Sends a data message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Object} options Options object
   * @param {Boolean} [options.compress=false] Specifies whether or not to
   *     compress `data`
   * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
   *     or text
   * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Function} [cb] Callback
   * @public
   */
  send(data, options, cb) {
    const buf = toBuffer(data);
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
    let opcode = options.binary ? 2 : 1;
    let rsv1 = options.compress;

    if (this._firstFragment) {
      this._firstFragment = false;
      if (rsv1 && perMessageDeflate) {
        rsv1 = buf.length >= perMessageDeflate._threshold;
      }
      this._compress = rsv1;
    } else {
      rsv1 = false;
      opcode = 0;
    }

    if (options.fin) this._firstFragment = true;

    if (perMessageDeflate) {
      const opts = {
        fin: options.fin,
        rsv1,
        opcode,
        mask: options.mask,
        readOnly: toBuffer.readOnly
      };

      if (this._deflating) {
        this.enqueue([this.dispatch, buf, this._compress, opts, cb]);
      } else {
        this.dispatch(buf, this._compress, opts, cb);
      }
    } else {
      this.sendFrame(
        Sender.frame(buf, {
          fin: options.fin,
          rsv1: false,
          opcode,
          mask: options.mask,
          readOnly: toBuffer.readOnly
        }),
        cb
      );
    }
  }

  /**
   * Dispatches a data message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} [compress=false] Specifies whether or not to compress
   *     `data`
   * @param {Object} options Options object
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @param {Function} [cb] Callback
   * @private
   */
  dispatch(data, compress, options, cb) {
    if (!compress) {
      this.sendFrame(Sender.frame(data, options), cb);
      return;
    }

    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    this._bufferedBytes += data.length;
    this._deflating = true;
    perMessageDeflate.compress(data, options.fin, (_, buf) => {
      if (this._socket.destroyed) {
        const err = new Error(
          'The socket was closed while data was being compressed'
        );

        if (typeof cb === 'function') cb(err);

        for (let i = 0; i < this._queue.length; i++) {
          const callback = this._queue[i][4];

          if (typeof callback === 'function') callback(err);
        }

        return;
      }

      this._bufferedBytes -= data.length;
      this._deflating = false;
      options.readOnly = false;
      this.sendFrame(Sender.frame(buf, options), cb);
      this.dequeue();
    });
  }

  /**
   * Executes queued send operations.
   *
   * @private
   */
  dequeue() {
    while (!this._deflating && this._queue.length) {
      const params = this._queue.shift();

      this._bufferedBytes -= params[1].length;
      Reflect.apply(params[0], this, params.slice(1));
    }
  }

  /**
   * Enqueues a send operation.
   *
   * @param {Array} params Send operation parameters.
   * @private
   */
  enqueue(params) {
    this._bufferedBytes += params[1].length;
    this._queue.push(params);
  }

  /**
   * Sends a frame.
   *
   * @param {Buffer[]} list The frame to send
   * @param {Function} [cb] Callback
   * @private
   */
  sendFrame(list, cb) {
    if (list.length === 2) {
      this._socket.cork();
      this._socket.write(list[0]);
      this._socket.write(list[1], cb);
      this._socket.uncork();
    } else {
      this._socket.write(list[0], cb);
    }
  }
}

module.exports = Sender;


/***/ }),

/***/ 787:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const { Duplex } = __nccwpck_require__(413);

/**
 * Emits the `'close'` event on a stream.
 *
 * @param {stream.Duplex} The stream.
 * @private
 */
function emitClose(stream) {
  stream.emit('close');
}

/**
 * The listener of the `'end'` event.
 *
 * @private
 */
function duplexOnEnd() {
  if (!this.destroyed && this._writableState.finished) {
    this.destroy();
  }
}

/**
 * The listener of the `'error'` event.
 *
 * @param {Error} err The error
 * @private
 */
function duplexOnError(err) {
  this.removeListener('error', duplexOnError);
  this.destroy();
  if (this.listenerCount('error') === 0) {
    // Do not suppress the throwing behavior.
    this.emit('error', err);
  }
}

/**
 * Wraps a `WebSocket` in a duplex stream.
 *
 * @param {WebSocket} ws The `WebSocket` to wrap
 * @param {Object} [options] The options for the `Duplex` constructor
 * @return {stream.Duplex} The duplex stream
 * @public
 */
function createWebSocketStream(ws, options) {
  let resumeOnReceiverDrain = true;

  function receiverOnDrain() {
    if (resumeOnReceiverDrain) ws._socket.resume();
  }

  if (ws.readyState === ws.CONNECTING) {
    ws.once('open', function open() {
      ws._receiver.removeAllListeners('drain');
      ws._receiver.on('drain', receiverOnDrain);
    });
  } else {
    ws._receiver.removeAllListeners('drain');
    ws._receiver.on('drain', receiverOnDrain);
  }

  const duplex = new Duplex({
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  });

  ws.on('message', function message(msg) {
    if (!duplex.push(msg)) {
      resumeOnReceiverDrain = false;
      ws._socket.pause();
    }
  });

  ws.once('error', function error(err) {
    if (duplex.destroyed) return;

    duplex.destroy(err);
  });

  ws.once('close', function close() {
    if (duplex.destroyed) return;

    duplex.push(null);
  });

  duplex._destroy = function (err, callback) {
    if (ws.readyState === ws.CLOSED) {
      callback(err);
      process.nextTick(emitClose, duplex);
      return;
    }

    let called = false;

    ws.once('error', function error(err) {
      called = true;
      callback(err);
    });

    ws.once('close', function close() {
      if (!called) callback(err);
      process.nextTick(emitClose, duplex);
    });
    ws.terminate();
  };

  duplex._final = function (callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._final(callback);
      });
      return;
    }

    // If the value of the `_socket` property is `null` it means that `ws` is a
    // client websocket and the handshake failed. In fact, when this happens, a
    // socket is never assigned to the websocket. Wait for the `'error'` event
    // that will be emitted by the websocket.
    if (ws._socket === null) return;

    if (ws._socket._writableState.finished) {
      callback();
      if (duplex._readableState.endEmitted) duplex.destroy();
    } else {
      ws._socket.once('finish', function finish() {
        // `duplex` is not destroyed here because the `'end'` event will be
        // emitted on `duplex` after this `'finish'` event. The EOF signaling
        // `null` chunk is, in fact, pushed when the websocket emits `'close'`.
        callback();
      });
      ws.close();
    }
  };

  duplex._read = function () {
    if (ws.readyState === ws.OPEN && !resumeOnReceiverDrain) {
      resumeOnReceiverDrain = true;
      if (!ws._receiver._writableState.needDrain) ws._socket.resume();
    }
  };

  duplex._write = function (chunk, encoding, callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._write(chunk, encoding, callback);
      });
      return;
    }

    ws.send(chunk, callback);
  };

  duplex.on('end', duplexOnEnd);
  duplex.on('error', duplexOnError);
  return duplex;
}

module.exports = createWebSocketStream;


/***/ }),

/***/ 653:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";


try {
  const isValidUTF8 = __nccwpck_require__(25);

  exports.isValidUTF8 =
    typeof isValidUTF8 === 'object'
      ? isValidUTF8.Validation.isValidUTF8 // utf-8-validate@<3.0.0
      : isValidUTF8;
} catch (e) /* istanbul ignore next */ {
  exports.isValidUTF8 = () => true;
}

/**
 * Checks if a status code is allowed in a close frame.
 *
 * @param {Number} code The status code
 * @return {Boolean} `true` if the status code is valid, else `false`
 * @public
 */
exports.isValidStatusCode = (code) => {
  return (
    (code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
};


/***/ }),

/***/ 695:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const EventEmitter = __nccwpck_require__(614);
const { createHash } = __nccwpck_require__(417);
const { createServer, STATUS_CODES } = __nccwpck_require__(605);

const PerMessageDeflate = __nccwpck_require__(458);
const WebSocket = __nccwpck_require__(784);
const { format, parse } = __nccwpck_require__(22);
const { GUID, kWebSocket } = __nccwpck_require__(89);

const keyRegex = /^[+/0-9A-Za-z]{22}==$/;

/**
 * Class representing a WebSocket server.
 *
 * @extends EventEmitter
 */
class WebSocketServer extends EventEmitter {
  /**
   * Create a `WebSocketServer` instance.
   *
   * @param {Object} options Configuration options
   * @param {Number} [options.backlog=511] The maximum length of the queue of
   *     pending connections
   * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
   *     track clients
   * @param {Function} [options.handleProtocols] A hook to handle protocols
   * @param {String} [options.host] The hostname where to bind the server
   * @param {Number} [options.maxPayload=104857600] The maximum allowed message
   *     size
   * @param {Boolean} [options.noServer=false] Enable no server mode
   * @param {String} [options.path] Accept only connections matching this path
   * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
   *     permessage-deflate
   * @param {Number} [options.port] The port where to bind the server
   * @param {http.Server} [options.server] A pre-created HTTP/S server to use
   * @param {Function} [options.verifyClient] A hook to reject connections
   * @param {Function} [callback] A listener for the `listening` event
   */
  constructor(options, callback) {
    super();

    options = {
      maxPayload: 100 * 1024 * 1024,
      perMessageDeflate: false,
      handleProtocols: null,
      clientTracking: true,
      verifyClient: null,
      noServer: false,
      backlog: null, // use default (511 as implemented in net.js)
      server: null,
      host: null,
      path: null,
      port: null,
      ...options
    };

    if (options.port == null && !options.server && !options.noServer) {
      throw new TypeError(
        'One of the "port", "server", or "noServer" options must be specified'
      );
    }

    if (options.port != null) {
      this._server = createServer((req, res) => {
        const body = STATUS_CODES[426];

        res.writeHead(426, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.end(body);
      });
      this._server.listen(
        options.port,
        options.host,
        options.backlog,
        callback
      );
    } else if (options.server) {
      this._server = options.server;
    }

    if (this._server) {
      const emitConnection = this.emit.bind(this, 'connection');

      this._removeListeners = addListeners(this._server, {
        listening: this.emit.bind(this, 'listening'),
        error: this.emit.bind(this, 'error'),
        upgrade: (req, socket, head) => {
          this.handleUpgrade(req, socket, head, emitConnection);
        }
      });
    }

    if (options.perMessageDeflate === true) options.perMessageDeflate = {};
    if (options.clientTracking) this.clients = new Set();
    this.options = options;
  }

  /**
   * Returns the bound address, the address family name, and port of the server
   * as reported by the operating system if listening on an IP socket.
   * If the server is listening on a pipe or UNIX domain socket, the name is
   * returned as a string.
   *
   * @return {(Object|String|null)} The address of the server
   * @public
   */
  address() {
    if (this.options.noServer) {
      throw new Error('The server is operating in "noServer" mode');
    }

    if (!this._server) return null;
    return this._server.address();
  }

  /**
   * Close the server.
   *
   * @param {Function} [cb] Callback
   * @public
   */
  close(cb) {
    if (cb) this.once('close', cb);

    //
    // Terminate all associated clients.
    //
    if (this.clients) {
      for (const client of this.clients) client.terminate();
    }

    const server = this._server;

    if (server) {
      this._removeListeners();
      this._removeListeners = this._server = null;

      //
      // Close the http server if it was internally created.
      //
      if (this.options.port != null) {
        server.close(() => this.emit('close'));
        return;
      }
    }

    process.nextTick(emitClose, this);
  }

  /**
   * See if a given request should be handled by this server instance.
   *
   * @param {http.IncomingMessage} req Request object to inspect
   * @return {Boolean} `true` if the request is valid, else `false`
   * @public
   */
  shouldHandle(req) {
    if (this.options.path) {
      const index = req.url.indexOf('?');
      const pathname = index !== -1 ? req.url.slice(0, index) : req.url;

      if (pathname !== this.options.path) return false;
    }

    return true;
  }

  /**
   * Handle a HTTP Upgrade request.
   *
   * @param {http.IncomingMessage} req The request object
   * @param {net.Socket} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @public
   */
  handleUpgrade(req, socket, head, cb) {
    socket.on('error', socketOnError);

    const key =
      req.headers['sec-websocket-key'] !== undefined
        ? req.headers['sec-websocket-key'].trim()
        : false;
    const version = +req.headers['sec-websocket-version'];
    const extensions = {};

    if (
      req.method !== 'GET' ||
      req.headers.upgrade.toLowerCase() !== 'websocket' ||
      !key ||
      !keyRegex.test(key) ||
      (version !== 8 && version !== 13) ||
      !this.shouldHandle(req)
    ) {
      return abortHandshake(socket, 400);
    }

    if (this.options.perMessageDeflate) {
      const perMessageDeflate = new PerMessageDeflate(
        this.options.perMessageDeflate,
        true,
        this.options.maxPayload
      );

      try {
        const offers = parse(req.headers['sec-websocket-extensions']);

        if (offers[PerMessageDeflate.extensionName]) {
          perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
          extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
      } catch (err) {
        return abortHandshake(socket, 400);
      }
    }

    //
    // Optionally call external client verification handler.
    //
    if (this.options.verifyClient) {
      const info = {
        origin:
          req.headers[`${version === 8 ? 'sec-websocket-origin' : 'origin'}`],
        secure: !!(req.socket.authorized || req.socket.encrypted),
        req
      };

      if (this.options.verifyClient.length === 2) {
        this.options.verifyClient(info, (verified, code, message, headers) => {
          if (!verified) {
            return abortHandshake(socket, code || 401, message, headers);
          }

          this.completeUpgrade(key, extensions, req, socket, head, cb);
        });
        return;
      }

      if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
    }

    this.completeUpgrade(key, extensions, req, socket, head, cb);
  }

  /**
   * Upgrade the connection to WebSocket.
   *
   * @param {String} key The value of the `Sec-WebSocket-Key` header
   * @param {Object} extensions The accepted extensions
   * @param {http.IncomingMessage} req The request object
   * @param {net.Socket} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @throws {Error} If called more than once with the same socket
   * @private
   */
  completeUpgrade(key, extensions, req, socket, head, cb) {
    //
    // Destroy the socket if the client has already sent a FIN packet.
    //
    if (!socket.readable || !socket.writable) return socket.destroy();

    if (socket[kWebSocket]) {
      throw new Error(
        'server.handleUpgrade() was called more than once with the same ' +
          'socket, possibly due to a misconfiguration'
      );
    }

    const digest = createHash('sha1')
      .update(key + GUID)
      .digest('base64');

    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${digest}`
    ];

    const ws = new WebSocket(null);
    let protocol = req.headers['sec-websocket-protocol'];

    if (protocol) {
      protocol = protocol.trim().split(/ *, */);

      //
      // Optionally call external protocol selection handler.
      //
      if (this.options.handleProtocols) {
        protocol = this.options.handleProtocols(protocol, req);
      } else {
        protocol = protocol[0];
      }

      if (protocol) {
        headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
        ws._protocol = protocol;
      }
    }

    if (extensions[PerMessageDeflate.extensionName]) {
      const params = extensions[PerMessageDeflate.extensionName].params;
      const value = format({
        [PerMessageDeflate.extensionName]: [params]
      });
      headers.push(`Sec-WebSocket-Extensions: ${value}`);
      ws._extensions = extensions;
    }

    //
    // Allow external modification/inspection of handshake headers.
    //
    this.emit('headers', headers, req);

    socket.write(headers.concat('\r\n').join('\r\n'));
    socket.removeListener('error', socketOnError);

    ws.setSocket(socket, head, this.options.maxPayload);

    if (this.clients) {
      this.clients.add(ws);
      ws.on('close', () => this.clients.delete(ws));
    }

    cb(ws, req);
  }
}

module.exports = WebSocketServer;

/**
 * Add event listeners on an `EventEmitter` using a map of <event, listener>
 * pairs.
 *
 * @param {EventEmitter} server The event emitter
 * @param {Object.<String, Function>} map The listeners to add
 * @return {Function} A function that will remove the added listeners when
 *     called
 * @private
 */
function addListeners(server, map) {
  for (const event of Object.keys(map)) server.on(event, map[event]);

  return function removeListeners() {
    for (const event of Object.keys(map)) {
      server.removeListener(event, map[event]);
    }
  };
}

/**
 * Emit a `'close'` event on an `EventEmitter`.
 *
 * @param {EventEmitter} server The event emitter
 * @private
 */
function emitClose(server) {
  server.emit('close');
}

/**
 * Handle premature socket errors.
 *
 * @private
 */
function socketOnError() {
  this.destroy();
}

/**
 * Close the connection when preconditions are not fulfilled.
 *
 * @param {net.Socket} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} [message] The HTTP response body
 * @param {Object} [headers] Additional HTTP response headers
 * @private
 */
function abortHandshake(socket, code, message, headers) {
  if (socket.writable) {
    message = message || STATUS_CODES[code];
    headers = {
      Connection: 'close',
      'Content-Type': 'text/html',
      'Content-Length': Buffer.byteLength(message),
      ...headers
    };

    socket.write(
      `HTTP/1.1 ${code} ${STATUS_CODES[code]}\r\n` +
        Object.keys(headers)
          .map((h) => `${h}: ${headers[h]}`)
          .join('\r\n') +
        '\r\n\r\n' +
        message
    );
  }

  socket.removeListener('error', socketOnError);
  socket.destroy();
}


/***/ }),

/***/ 784:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const EventEmitter = __nccwpck_require__(614);
const https = __nccwpck_require__(211);
const http = __nccwpck_require__(605);
const net = __nccwpck_require__(631);
const tls = __nccwpck_require__(16);
const { randomBytes, createHash } = __nccwpck_require__(417);
const { URL } = __nccwpck_require__(835);

const PerMessageDeflate = __nccwpck_require__(458);
const Receiver = __nccwpck_require__(706);
const Sender = __nccwpck_require__(479);
const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  GUID,
  kStatusCode,
  kWebSocket,
  NOOP
} = __nccwpck_require__(89);
const { addEventListener, removeEventListener } = __nccwpck_require__(447);
const { format, parse } = __nccwpck_require__(22);
const { toBuffer } = __nccwpck_require__(366);

const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
const protocolVersions = [8, 13];
const closeTimeout = 30 * 1000;

/**
 * Class representing a WebSocket.
 *
 * @extends EventEmitter
 */
class WebSocket extends EventEmitter {
  /**
   * Create a new `WebSocket`.
   *
   * @param {(String|url.URL)} address The URL to which to connect
   * @param {(String|String[])} [protocols] The subprotocols
   * @param {Object} [options] Connection options
   */
  constructor(address, protocols, options) {
    super();

    this._binaryType = BINARY_TYPES[0];
    this._closeCode = 1006;
    this._closeFrameReceived = false;
    this._closeFrameSent = false;
    this._closeMessage = '';
    this._closeTimer = null;
    this._extensions = {};
    this._protocol = '';
    this._readyState = WebSocket.CONNECTING;
    this._receiver = null;
    this._sender = null;
    this._socket = null;

    if (address !== null) {
      this._bufferedAmount = 0;
      this._isServer = false;
      this._redirects = 0;

      if (Array.isArray(protocols)) {
        protocols = protocols.join(', ');
      } else if (typeof protocols === 'object' && protocols !== null) {
        options = protocols;
        protocols = undefined;
      }

      initAsClient(this, address, protocols, options);
    } else {
      this._isServer = true;
    }
  }

  /**
   * This deviates from the WHATWG interface since ws doesn't support the
   * required default "blob" type (instead we define a custom "nodebuffer"
   * type).
   *
   * @type {String}
   */
  get binaryType() {
    return this._binaryType;
  }

  set binaryType(type) {
    if (!BINARY_TYPES.includes(type)) return;

    this._binaryType = type;

    //
    // Allow to change `binaryType` on the fly.
    //
    if (this._receiver) this._receiver._binaryType = type;
  }

  /**
   * @type {Number}
   */
  get bufferedAmount() {
    if (!this._socket) return this._bufferedAmount;

    return this._socket._writableState.length + this._sender._bufferedBytes;
  }

  /**
   * @type {String}
   */
  get extensions() {
    return Object.keys(this._extensions).join();
  }

  /**
   * @type {String}
   */
  get protocol() {
    return this._protocol;
  }

  /**
   * @type {Number}
   */
  get readyState() {
    return this._readyState;
  }

  /**
   * @type {String}
   */
  get url() {
    return this._url;
  }

  /**
   * Set up the socket and the internal resources.
   *
   * @param {net.Socket} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Number} [maxPayload=0] The maximum allowed message size
   * @private
   */
  setSocket(socket, head, maxPayload) {
    const receiver = new Receiver(
      this.binaryType,
      this._extensions,
      this._isServer,
      maxPayload
    );

    this._sender = new Sender(socket, this._extensions);
    this._receiver = receiver;
    this._socket = socket;

    receiver[kWebSocket] = this;
    socket[kWebSocket] = this;

    receiver.on('conclude', receiverOnConclude);
    receiver.on('drain', receiverOnDrain);
    receiver.on('error', receiverOnError);
    receiver.on('message', receiverOnMessage);
    receiver.on('ping', receiverOnPing);
    receiver.on('pong', receiverOnPong);

    socket.setTimeout(0);
    socket.setNoDelay();

    if (head.length > 0) socket.unshift(head);

    socket.on('close', socketOnClose);
    socket.on('data', socketOnData);
    socket.on('end', socketOnEnd);
    socket.on('error', socketOnError);

    this._readyState = WebSocket.OPEN;
    this.emit('open');
  }

  /**
   * Emit the `'close'` event.
   *
   * @private
   */
  emitClose() {
    if (!this._socket) {
      this._readyState = WebSocket.CLOSED;
      this.emit('close', this._closeCode, this._closeMessage);
      return;
    }

    if (this._extensions[PerMessageDeflate.extensionName]) {
      this._extensions[PerMessageDeflate.extensionName].cleanup();
    }

    this._receiver.removeAllListeners();
    this._readyState = WebSocket.CLOSED;
    this.emit('close', this._closeCode, this._closeMessage);
  }

  /**
   * Start a closing handshake.
   *
   *          +----------+   +-----------+   +----------+
   *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
   *    |     +----------+   +-----------+   +----------+     |
   *          +----------+   +-----------+         |
   * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
   *          +----------+   +-----------+   |
   *    |           |                        |   +---+        |
   *                +------------------------+-->|fin| - - - -
   *    |         +---+                      |   +---+
   *     - - - - -|fin|<---------------------+
   *              +---+
   *
   * @param {Number} [code] Status code explaining why the connection is closing
   * @param {String} [data] A string explaining why the connection is closing
   * @public
   */
  close(code, data) {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      return abortHandshake(this, this._req, msg);
    }

    if (this.readyState === WebSocket.CLOSING) {
      if (this._closeFrameSent && this._closeFrameReceived) this._socket.end();
      return;
    }

    this._readyState = WebSocket.CLOSING;
    this._sender.close(code, data, !this._isServer, (err) => {
      //
      // This error is handled by the `'error'` listener on the socket. We only
      // want to know if the close frame has been sent here.
      //
      if (err) return;

      this._closeFrameSent = true;
      if (this._closeFrameReceived) this._socket.end();
    });

    //
    // Specify a timeout for the closing handshake to complete.
    //
    this._closeTimer = setTimeout(
      this._socket.destroy.bind(this._socket),
      closeTimeout
    );
  }

  /**
   * Send a ping.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the ping is sent
   * @public
   */
  ping(data, mask, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
    this._sender.ping(data || EMPTY_BUFFER, mask, cb);
  }

  /**
   * Send a pong.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the pong is sent
   * @public
   */
  pong(data, mask, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
    this._sender.pong(data || EMPTY_BUFFER, mask, cb);
  }

  /**
   * Send a data message.
   *
   * @param {*} data The message to send
   * @param {Object} [options] Options object
   * @param {Boolean} [options.compress] Specifies whether or not to compress
   *     `data`
   * @param {Boolean} [options.binary] Specifies whether `data` is binary or
   *     text
   * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when data is written out
   * @public
   */
  send(data, options, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    const opts = {
      binary: typeof data !== 'string',
      mask: !this._isServer,
      compress: true,
      fin: true,
      ...options
    };

    if (!this._extensions[PerMessageDeflate.extensionName]) {
      opts.compress = false;
    }

    this._sender.send(data || EMPTY_BUFFER, opts, cb);
  }

  /**
   * Forcibly close the connection.
   *
   * @public
   */
  terminate() {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      return abortHandshake(this, this._req, msg);
    }

    if (this._socket) {
      this._readyState = WebSocket.CLOSING;
      this._socket.destroy();
    }
  }
}

readyStates.forEach((readyState, i) => {
  const descriptor = { enumerable: true, value: i };

  Object.defineProperty(WebSocket.prototype, readyState, descriptor);
  Object.defineProperty(WebSocket, readyState, descriptor);
});

[
  'binaryType',
  'bufferedAmount',
  'extensions',
  'protocol',
  'readyState',
  'url'
].forEach((property) => {
  Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
});

//
// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
//
['open', 'error', 'close', 'message'].forEach((method) => {
  Object.defineProperty(WebSocket.prototype, `on${method}`, {
    configurable: true,
    enumerable: true,
    /**
     * Return the listener of the event.
     *
     * @return {(Function|undefined)} The event listener or `undefined`
     * @public
     */
    get() {
      const listeners = this.listeners(method);
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i]._listener) return listeners[i]._listener;
      }

      return undefined;
    },
    /**
     * Add a listener for the event.
     *
     * @param {Function} listener The listener to add
     * @public
     */
    set(listener) {
      const listeners = this.listeners(method);
      for (let i = 0; i < listeners.length; i++) {
        //
        // Remove only the listeners added via `addEventListener`.
        //
        if (listeners[i]._listener) this.removeListener(method, listeners[i]);
      }
      this.addEventListener(method, listener);
    }
  });
});

WebSocket.prototype.addEventListener = addEventListener;
WebSocket.prototype.removeEventListener = removeEventListener;

module.exports = WebSocket;

/**
 * Initialize a WebSocket client.
 *
 * @param {WebSocket} websocket The client to initialize
 * @param {(String|url.URL)} address The URL to which to connect
 * @param {String} [protocols] The subprotocols
 * @param {Object} [options] Connection options
 * @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
 *     permessage-deflate
 * @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
 *     handshake request
 * @param {Number} [options.protocolVersion=13] Value of the
 *     `Sec-WebSocket-Version` header
 * @param {String} [options.origin] Value of the `Origin` or
 *     `Sec-WebSocket-Origin` header
 * @param {Number} [options.maxPayload=104857600] The maximum allowed message
 *     size
 * @param {Boolean} [options.followRedirects=false] Whether or not to follow
 *     redirects
 * @param {Number} [options.maxRedirects=10] The maximum number of redirects
 *     allowed
 * @private
 */
function initAsClient(websocket, address, protocols, options) {
  const opts = {
    protocolVersion: protocolVersions[1],
    maxPayload: 100 * 1024 * 1024,
    perMessageDeflate: true,
    followRedirects: false,
    maxRedirects: 10,
    ...options,
    createConnection: undefined,
    socketPath: undefined,
    hostname: undefined,
    protocol: undefined,
    timeout: undefined,
    method: undefined,
    host: undefined,
    path: undefined,
    port: undefined
  };

  if (!protocolVersions.includes(opts.protocolVersion)) {
    throw new RangeError(
      `Unsupported protocol version: ${opts.protocolVersion} ` +
        `(supported versions: ${protocolVersions.join(', ')})`
    );
  }

  let parsedUrl;

  if (address instanceof URL) {
    parsedUrl = address;
    websocket._url = address.href;
  } else {
    parsedUrl = new URL(address);
    websocket._url = address;
  }

  const isUnixSocket = parsedUrl.protocol === 'ws+unix:';

  if (!parsedUrl.host && (!isUnixSocket || !parsedUrl.pathname)) {
    throw new Error(`Invalid URL: ${websocket.url}`);
  }

  const isSecure =
    parsedUrl.protocol === 'wss:' || parsedUrl.protocol === 'https:';
  const defaultPort = isSecure ? 443 : 80;
  const key = randomBytes(16).toString('base64');
  const get = isSecure ? https.get : http.get;
  let perMessageDeflate;

  opts.createConnection = isSecure ? tlsConnect : netConnect;
  opts.defaultPort = opts.defaultPort || defaultPort;
  opts.port = parsedUrl.port || defaultPort;
  opts.host = parsedUrl.hostname.startsWith('[')
    ? parsedUrl.hostname.slice(1, -1)
    : parsedUrl.hostname;
  opts.headers = {
    'Sec-WebSocket-Version': opts.protocolVersion,
    'Sec-WebSocket-Key': key,
    Connection: 'Upgrade',
    Upgrade: 'websocket',
    ...opts.headers
  };
  opts.path = parsedUrl.pathname + parsedUrl.search;
  opts.timeout = opts.handshakeTimeout;

  if (opts.perMessageDeflate) {
    perMessageDeflate = new PerMessageDeflate(
      opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
      false,
      opts.maxPayload
    );
    opts.headers['Sec-WebSocket-Extensions'] = format({
      [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
    });
  }
  if (protocols) {
    opts.headers['Sec-WebSocket-Protocol'] = protocols;
  }
  if (opts.origin) {
    if (opts.protocolVersion < 13) {
      opts.headers['Sec-WebSocket-Origin'] = opts.origin;
    } else {
      opts.headers.Origin = opts.origin;
    }
  }
  if (parsedUrl.username || parsedUrl.password) {
    opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
  }

  if (isUnixSocket) {
    const parts = opts.path.split(':');

    opts.socketPath = parts[0];
    opts.path = parts[1];
  }

  let req = (websocket._req = get(opts));

  if (opts.timeout) {
    req.on('timeout', () => {
      abortHandshake(websocket, req, 'Opening handshake has timed out');
    });
  }

  req.on('error', (err) => {
    if (req === null || req.aborted) return;

    req = websocket._req = null;
    websocket._readyState = WebSocket.CLOSING;
    websocket.emit('error', err);
    websocket.emitClose();
  });

  req.on('response', (res) => {
    const location = res.headers.location;
    const statusCode = res.statusCode;

    if (
      location &&
      opts.followRedirects &&
      statusCode >= 300 &&
      statusCode < 400
    ) {
      if (++websocket._redirects > opts.maxRedirects) {
        abortHandshake(websocket, req, 'Maximum redirects exceeded');
        return;
      }

      req.abort();

      const addr = new URL(location, address);

      initAsClient(websocket, addr, protocols, options);
    } else if (!websocket.emit('unexpected-response', req, res)) {
      abortHandshake(
        websocket,
        req,
        `Unexpected server response: ${res.statusCode}`
      );
    }
  });

  req.on('upgrade', (res, socket, head) => {
    websocket.emit('upgrade', res);

    //
    // The user may have closed the connection from a listener of the `upgrade`
    // event.
    //
    if (websocket.readyState !== WebSocket.CONNECTING) return;

    req = websocket._req = null;

    const digest = createHash('sha1')
      .update(key + GUID)
      .digest('base64');

    if (res.headers['sec-websocket-accept'] !== digest) {
      abortHandshake(websocket, socket, 'Invalid Sec-WebSocket-Accept header');
      return;
    }

    const serverProt = res.headers['sec-websocket-protocol'];
    const protList = (protocols || '').split(/, */);
    let protError;

    if (!protocols && serverProt) {
      protError = 'Server sent a subprotocol but none was requested';
    } else if (protocols && !serverProt) {
      protError = 'Server sent no subprotocol';
    } else if (serverProt && !protList.includes(serverProt)) {
      protError = 'Server sent an invalid subprotocol';
    }

    if (protError) {
      abortHandshake(websocket, socket, protError);
      return;
    }

    if (serverProt) websocket._protocol = serverProt;

    if (perMessageDeflate) {
      try {
        const extensions = parse(res.headers['sec-websocket-extensions']);

        if (extensions[PerMessageDeflate.extensionName]) {
          perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
          websocket._extensions[
            PerMessageDeflate.extensionName
          ] = perMessageDeflate;
        }
      } catch (err) {
        abortHandshake(
          websocket,
          socket,
          'Invalid Sec-WebSocket-Extensions header'
        );
        return;
      }
    }

    websocket.setSocket(socket, head, opts.maxPayload);
  });
}

/**
 * Create a `net.Socket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {net.Socket} The newly created socket used to start the connection
 * @private
 */
function netConnect(options) {
  options.path = options.socketPath;
  return net.connect(options);
}

/**
 * Create a `tls.TLSSocket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {tls.TLSSocket} The newly created socket used to start the connection
 * @private
 */
function tlsConnect(options) {
  options.path = undefined;

  if (!options.servername && options.servername !== '') {
    options.servername = net.isIP(options.host) ? '' : options.host;
  }

  return tls.connect(options);
}

/**
 * Abort the handshake and emit an error.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {(http.ClientRequest|net.Socket)} stream The request to abort or the
 *     socket to destroy
 * @param {String} message The error message
 * @private
 */
function abortHandshake(websocket, stream, message) {
  websocket._readyState = WebSocket.CLOSING;

  const err = new Error(message);
  Error.captureStackTrace(err, abortHandshake);

  if (stream.setHeader) {
    stream.abort();
    stream.once('abort', websocket.emitClose.bind(websocket));
    websocket.emit('error', err);
  } else {
    stream.destroy(err);
    stream.once('error', websocket.emit.bind(websocket, 'error'));
    stream.once('close', websocket.emitClose.bind(websocket));
  }
}

/**
 * Handle cases where the `ping()`, `pong()`, or `send()` methods are called
 * when the `readyState` attribute is `CLOSING` or `CLOSED`.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {*} [data] The data to send
 * @param {Function} [cb] Callback
 * @private
 */
function sendAfterClose(websocket, data, cb) {
  if (data) {
    const length = toBuffer(data).length;

    //
    // The `_bufferedAmount` property is used only when the peer is a client and
    // the opening handshake fails. Under these circumstances, in fact, the
    // `setSocket()` method is not called, so the `_socket` and `_sender`
    // properties are set to `null`.
    //
    if (websocket._socket) websocket._sender._bufferedBytes += length;
    else websocket._bufferedAmount += length;
  }

  if (cb) {
    const err = new Error(
      `WebSocket is not open: readyState ${websocket.readyState} ` +
        `(${readyStates[websocket.readyState]})`
    );
    cb(err);
  }
}

/**
 * The listener of the `Receiver` `'conclude'` event.
 *
 * @param {Number} code The status code
 * @param {String} reason The reason for closing
 * @private
 */
function receiverOnConclude(code, reason) {
  const websocket = this[kWebSocket];

  websocket._socket.removeListener('data', socketOnData);
  websocket._socket.resume();

  websocket._closeFrameReceived = true;
  websocket._closeMessage = reason;
  websocket._closeCode = code;

  if (code === 1005) websocket.close();
  else websocket.close(code, reason);
}

/**
 * The listener of the `Receiver` `'drain'` event.
 *
 * @private
 */
function receiverOnDrain() {
  this[kWebSocket]._socket.resume();
}

/**
 * The listener of the `Receiver` `'error'` event.
 *
 * @param {(RangeError|Error)} err The emitted error
 * @private
 */
function receiverOnError(err) {
  const websocket = this[kWebSocket];

  websocket._socket.removeListener('data', socketOnData);

  websocket._readyState = WebSocket.CLOSING;
  websocket._closeCode = err[kStatusCode];
  websocket.emit('error', err);
  websocket._socket.destroy();
}

/**
 * The listener of the `Receiver` `'finish'` event.
 *
 * @private
 */
function receiverOnFinish() {
  this[kWebSocket].emitClose();
}

/**
 * The listener of the `Receiver` `'message'` event.
 *
 * @param {(String|Buffer|ArrayBuffer|Buffer[])} data The message
 * @private
 */
function receiverOnMessage(data) {
  this[kWebSocket].emit('message', data);
}

/**
 * The listener of the `Receiver` `'ping'` event.
 *
 * @param {Buffer} data The data included in the ping frame
 * @private
 */
function receiverOnPing(data) {
  const websocket = this[kWebSocket];

  websocket.pong(data, !websocket._isServer, NOOP);
  websocket.emit('ping', data);
}

/**
 * The listener of the `Receiver` `'pong'` event.
 *
 * @param {Buffer} data The data included in the pong frame
 * @private
 */
function receiverOnPong(data) {
  this[kWebSocket].emit('pong', data);
}

/**
 * The listener of the `net.Socket` `'close'` event.
 *
 * @private
 */
function socketOnClose() {
  const websocket = this[kWebSocket];

  this.removeListener('close', socketOnClose);
  this.removeListener('end', socketOnEnd);

  websocket._readyState = WebSocket.CLOSING;

  //
  // The close frame might not have been received or the `'end'` event emitted,
  // for example, if the socket was destroyed due to an error. Ensure that the
  // `receiver` stream is closed after writing any remaining buffered data to
  // it. If the readable side of the socket is in flowing mode then there is no
  // buffered data as everything has been already written and `readable.read()`
  // will return `null`. If instead, the socket is paused, any possible buffered
  // data will be read as a single chunk and emitted synchronously in a single
  // `'data'` event.
  //
  websocket._socket.read();
  websocket._receiver.end();

  this.removeListener('data', socketOnData);
  this[kWebSocket] = undefined;

  clearTimeout(websocket._closeTimer);

  if (
    websocket._receiver._writableState.finished ||
    websocket._receiver._writableState.errorEmitted
  ) {
    websocket.emitClose();
  } else {
    websocket._receiver.on('error', receiverOnFinish);
    websocket._receiver.on('finish', receiverOnFinish);
  }
}

/**
 * The listener of the `net.Socket` `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function socketOnData(chunk) {
  if (!this[kWebSocket]._receiver.write(chunk)) {
    this.pause();
  }
}

/**
 * The listener of the `net.Socket` `'end'` event.
 *
 * @private
 */
function socketOnEnd() {
  const websocket = this[kWebSocket];

  websocket._readyState = WebSocket.CLOSING;
  websocket._receiver.end();
  this.end();
}

/**
 * The listener of the `net.Socket` `'error'` event.
 *
 * @private
 */
function socketOnError() {
  const websocket = this[kWebSocket];

  this.removeListener('error', socketOnError);
  this.on('error', NOOP);

  if (websocket) {
    websocket._readyState = WebSocket.CLOSING;
    this.destroy();
  }
}


/***/ }),

/***/ 709:
/***/ ((module) => {

module.exports = eval("require")("bufferutil");


/***/ }),

/***/ 522:
/***/ ((module) => {

module.exports = eval("require")("encoding");


/***/ }),

/***/ 25:
/***/ ((module) => {

module.exports = eval("require")("utf-8-validate");


/***/ }),

/***/ 417:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");;

/***/ }),

/***/ 614:
/***/ ((module) => {

"use strict";
module.exports = require("events");;

/***/ }),

/***/ 605:
/***/ ((module) => {

"use strict";
module.exports = require("http");;

/***/ }),

/***/ 211:
/***/ ((module) => {

"use strict";
module.exports = require("https");;

/***/ }),

/***/ 631:
/***/ ((module) => {

"use strict";
module.exports = require("net");;

/***/ }),

/***/ 413:
/***/ ((module) => {

"use strict";
module.exports = require("stream");;

/***/ }),

/***/ 16:
/***/ ((module) => {

"use strict";
module.exports = require("tls");;

/***/ }),

/***/ 835:
/***/ ((module) => {

"use strict";
module.exports = require("url");;

/***/ }),

/***/ 761:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(900);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;