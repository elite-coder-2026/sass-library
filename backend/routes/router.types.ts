export type Handler = (req: any, res: any, next: any) => any;

export type RouterLike = {
  get: (path: string, handler: Handler) => unknown;
  post: (path: string, handler: Handler) => unknown;
  patch: (path: string, handler: Handler) => unknown;
  delete: (path: string, handler: Handler) => unknown;
};

