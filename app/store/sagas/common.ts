type R<T> = T extends Promise<infer U> ? U : T
export type YieldReturn<T> = R<
  ReturnType<T extends (...args: any) => any ? T : any>
>
