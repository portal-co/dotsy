export type Splice = (string | { value: any })[];
export function dotsy<T, Args extends unknown[]>({
  process,
  template,
  seperator = "//",
}: {
  process: (a: string) => Splice;
  template: (t: TemplateStringsArray, ...args: Args) => T;
  seperator?: string;
}): (t: TemplateStringsArray, ...args: Args) => T {
  return (t, ...args) => {
    const raw = t.raw;
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
          for (const item of processed) {
            if (typeof item === "string") {
              if (newTemplate.length === newArgs.length + 1) {
                newTemplate.push(item);
              } else {
                newTemplate[newTemplate.length - 1] += item;
              }
            } else {
              newArgs.push(item.value);
              newTemplate.push("");
            }
          }
        }
      }
      if (i in args) newArgs.push(args[i]);
    }
    (newTemplate as any).raw = raw;
    return template(newTemplate as any, ...(newArgs as Args));
  };
}
export function templ(
  t: TemplateStringsArray,
  ...args: any[]
): Splice {
  let a: Splice = [];
  for (let i = 0; i < t.length; i++) {
    a.push(t[i]);
    if (i in args) a.push({ value: args[i] });
  }
  return a;
}
