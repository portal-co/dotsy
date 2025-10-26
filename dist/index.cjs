"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dotsy = exports.templ = exports.Splice = void 0;
const { getOwnPropertyDescriptor, defineProperty } = Object;
const snap = ((bind) => bind.bind(bind.call))(Function.prototype.bind);
const bind = snap(Function.prototype.bind);
const push = snap(Array.prototype.push);
const flatMap = snap(Array.prototype.flatMap);
const split = snap(String.prototype.split);
class Splice {
    #internal;
    flatMap = (a) => Splice.#fromInternal(flatMap(this.#internal, function* (i) {
        if (typeof i === "string") {
            yield i;
        }
        else {
            yield* a(i[0]).#internal;
        }
    }));
    render = (a) => {
        let newTemplate = [], newArgs = [];
        for (const item of this.#internal) {
            if (typeof item === "string") {
                if (newTemplate.length === newArgs.length + 1) {
                    push(newTemplate, item);
                }
                else {
                    newTemplate[newTemplate.length - 1] += item;
                }
            }
            else {
                push(newArgs, item[0]);
                push(newTemplate, "");
            }
        }
        defineProperty(newTemplate, "raw", {
            configurable: false,
            enumerable: true,
            get() {
                throw new TypeError("Template is not raw");
            },
        });
        return a(newTemplate, ...newArgs);
    };
    static #isConstructingInternal = false;
    static #fromInternal(a) {
        Splice.#isConstructingInternal = true;
        return new Splice(a);
    }
    constructor(t, ...args) {
        if (Splice.#isConstructingInternal) {
            this.#internal = t;
            Splice.#isConstructingInternal = false;
        }
        else {
            let a = [];
            for (let i = 0; i < t.length; i++) {
                push(a, t[i]);
                if (i in args)
                    push(a, [args[i]]);
            }
            this.#internal = a;
        }
    }
    static templ(t, ...args) {
        return new Splice(t, ...args);
    }
    static dotsy({ process, template, seperator = "//", }) {
        return (t, ...args) => {
            const raw = getOwnPropertyDescriptor(t, "raw");
            if ("get" in raw)
                raw.get = bind(raw.get, t);
            if ("set" in raw)
                raw.set = bind(raw.set, t);
            const items = [...t];
            let newTemplate = [];
            let newArgs = [];
            let mode = false;
            for (let i = 0; i < items.length; i++) {
                const dotted = split(items[i], seperator);
                for (const val of dotted) {
                    mode = !mode;
                    if (mode) {
                        if (newTemplate.length === newArgs.length + 1) {
                            push(newTemplate, val);
                        }
                        else {
                            newTemplate[newTemplate.length - 1] += val;
                        }
                    }
                    else {
                        const processed = process(val);
                        for (const item of processed.#internal) {
                            if (typeof item === "string") {
                                if (newTemplate.length === newArgs.length + 1) {
                                    push(newTemplate, item);
                                }
                                else {
                                    newTemplate[newTemplate.length - 1] += item;
                                }
                            }
                            else {
                                push(newArgs, item[0]);
                                push(newTemplate, "");
                            }
                        }
                    }
                }
                if (i in args)
                    push(newArgs, args[i]);
            }
            defineProperty(newTemplate, "raw", raw);
            return template(newTemplate, ...newArgs);
        };
    }
}
exports.Splice = Splice;
exports.templ = Splice.templ, exports.dotsy = Splice.dotsy;
