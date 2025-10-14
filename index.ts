type Splice_ = (string | [any])[];
export class Splice {
  readonly #internal: Splice_;
  flatMap = (a: (a: any) => Splice) =>
    this.#internal.flatMap(function* (i) {
      if (typeof i === "string") {
        yield i;
      } else {
        yield* a(i[0]).#internal;
      }
    });
  render = <T>(a: (t: TemplateStringsArray, ...args: any[]) => T): T => {
    let newTemplate = [],
      newArgs = [];
    for (const item of this.#internal) {
      if (typeof item === "string") {
        if (newTemplate.length === newArgs.length + 1) {
          newTemplate.push(item);
        } else {
          newTemplate[newTemplate.length - 1] += item;
        }
      } else {
        newArgs.push(item[0]);
        newTemplate.push("");
      }
    }
    Object.defineProperty(newTemplate, "raw", {
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
      a.push(t[i]);
      if (i in args) a.push([args[i]]);
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
      const raw = Object.getOwnPropertyDescriptor(t, "raw")!;
      if ("get" in raw) raw.get = raw.get?.bind(t);
      if ("set" in raw) raw.set = raw.set?.bind(t);
      const items = [...t];
      let newTemplate: string[] = [];
      let newArgs = [];
      let mode = false;
      for (let i = 0; i < items.length; i++) {
        const dotted = items[i].split(seperator);
        for (const val of dotted) {
          mode = !mode;
          if (mode) {
            if (newTemplate.length === newArgs.length + 1) {
              newTemplate.push(val);
            } else {
              newTemplate[newTemplate.length - 1] += val;
            }
          } else {
            const processed = process(val);
            for (const item of processed.#internal) {
              if (typeof item === "string") {
                if (newTemplate.length === newArgs.length + 1) {
                  newTemplate.push(item);
                } else {
                  newTemplate[newTemplate.length - 1] += item;
                }
              } else {
                newArgs.push(item[0]);
                newTemplate.push("");
              }
            }
          }
        }
        if (i in args) newArgs.push(args[i]);
      }
      Object.defineProperty(newTemplate, "raw", raw);
      return template(newTemplate as any, ...(newArgs as Args));
    };
  }
}
export const { templ, dotsy } = Splice;
