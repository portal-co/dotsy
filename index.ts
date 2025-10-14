type Splice_ = (string | [any])[];
const { getOwnPropertyDescriptor, defineProperty } = Object;
const snap = ((bind) => bind.bind(bind.call))(Function.prototype.bind);
const bind = snap(Function.prototype.bind);
const push: <T>(a: T[], b: T) => void = snap(Array.prototype.push);
const flatMap = snap(Array.prototype.flatMap);
const split = snap(String.prototype.split);
export class Splice {
  readonly #internal: Splice_;
  flatMap = (a: (a: any) => Splice) =>
    flatMap(this.#internal, function* (i: string | [any]) {
      if (typeof i === "string") {
        yield i;
      } else {
        yield* a(i[0]).#internal;
      }
    });
  render = <T>(a: (t: TemplateStringsArray, ...args: any[]) => T): T => {
    let newTemplate: string[] = [],
      newArgs: any[] = [];
    for (const item of this.#internal) {
      if (typeof item === "string") {
        if (newTemplate.length === newArgs.length + 1) {
          push(newTemplate, item);
        } else {
          newTemplate[newTemplate.length - 1] += item;
        }
      } else {
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
    return a(newTemplate as any, ...newArgs);
  };
  constructor(t: TemplateStringsArray, ...args: any[]) {
    let a: Splice_ = [];
    for (let i = 0; i < t.length; i++) {
      push(a, t[i]);
      if (i in args) push(a, [args[i]]);
    }
    this.#internal = a;
  }
  static templ(t: TemplateStringsArray, ...args: any): Splice {
    return new Splice(t, ...args);
  }
  static dotsy<T, Args extends unknown[]>({
    process,
    template,
    seperator = "//",
  }: {
    process: (a: string) => Splice;
    template: (t: TemplateStringsArray, ...args: Args) => T;
    seperator?: string;
  }): (t: TemplateStringsArray, ...args: Args) => T {
    return (t, ...args) => {
      const raw = getOwnPropertyDescriptor(t, "raw")!;
      if ("get" in raw) raw.get = bind(raw.get!, t);
      if ("set" in raw) raw.set = bind(raw.set!, t);
      const items = [...t];
      let newTemplate: string[] = [];
      let newArgs: any[] = [];
      let mode = false;
      for (let i = 0; i < items.length; i++) {
        const dotted = split(items[i], seperator);
        for (const val of dotted) {
          mode = !mode;
          if (mode) {
            if (newTemplate.length === newArgs.length + 1) {
              push(newTemplate, val);
            } else {
              newTemplate[newTemplate.length - 1] += val;
            }
          } else {
            const processed = process(val);
            for (const item of processed.#internal) {
              if (typeof item === "string") {
                if (newTemplate.length === newArgs.length + 1) {
                  push(newTemplate, item);
                } else {
                  newTemplate[newTemplate.length - 1] += item;
                }
              } else {
                push(newArgs, item[0]);
                push(newTemplate, "");
              }
            }
          }
        }
        if (i in args) push(newArgs, args[i]);
      }
      defineProperty(newTemplate, "raw", raw);
      return template(newTemplate as any, ...(newArgs as Args));
    };
  }
}
export const { templ, dotsy } = Splice;
