import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envCandidates = [
  // Prefer the .env next to this file (same folder as server.js/db.js)
  path.resolve(__dirname, ".env"),
  // Fallback to current working directory (useful for local runs)
  path.resolve(process.cwd(), ".env"),
];

let loadedEnvPath = null;
for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate, override: true });
    loadedEnvPath = candidate;
    break;
  }
}

if (!loadedEnvPath) {
  dotenv.config({ override: true });
}

if (loadedEnvPath) {
  process.env.ENV_PATH_USED = loadedEnvPath;
}

export const ENV_PATH_USED = loadedEnvPath;

