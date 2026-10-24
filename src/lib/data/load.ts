import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Dataset } from "./types";

let cache: Dataset | null = null;

/** Reads the dataset generated at build time. Throws if the collector did not run. */
export function dataset(): Dataset {
  if (cache) return cache;
  const file = path.join(process.cwd(), "data/generated/dataset.json");
  cache = JSON.parse(readFileSync(file, "utf8")) as Dataset;
  return cache;
}

export function tipoTitulo(d: Dataset, contract: string): string {
  return d.tipos.find((t) => t.contract === contract)?.titulo ?? contract;
}
