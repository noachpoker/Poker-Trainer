// Hash routes look like "#/math?m=spr&ch=7".

export function routePath(): string {
  return location.hash.replace(/^#\/?/, '').split('?')[0];
}

export function routeParam(name: string): string | null {
  const q = location.hash.split('?')[1] ?? '';
  return new URLSearchParams(q).get(name);
}
