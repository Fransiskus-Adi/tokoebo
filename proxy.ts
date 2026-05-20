import type { NextRequest } from "next/server";
import { proxy as sourceProxy } from "./src/proxy";

export function proxy(request: NextRequest) {
  return sourceProxy(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
