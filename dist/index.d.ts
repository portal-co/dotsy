export declare class Splice {
    #private;
    flatMap: (a: (a: any) => Splice) => Splice;
    render: <T>(a: (t: TemplateStringsArray, ...args: any[]) => T) => T;
    constructor(t: TemplateStringsArray, ...args: any[]);
    static templ(t: TemplateStringsArray, ...args: any): Splice;
    static dotsy<T, Args extends unknown[]>({ process, template, seperator, }: {
        process: (a: string) => Splice;
        template: (t: TemplateStringsArray, ...args: Args) => T;
        seperator?: string;
    }): (t: TemplateStringsArray, ...args: Args) => T;
}
export declare const templ: typeof Splice.templ, dotsy: typeof Splice.dotsy;
