import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";
import type { NextRequest } from "next/server";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" })
    .stdout?.trim() || crypto.randomUUID();

const handler = createSerwistRoute({
  additionalPrecacheEntries: [
    { url: "/~offline", revision },
  ],
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
});

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handler.GET(request, { params: context.params as unknown as Promise<{ path: string }> });
}
