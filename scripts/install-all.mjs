import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projects = ["client", "auth", "tickets", "orders", "common"];

function runNpmInstall(projectDir) {
  const direct = spawnSync("npm", ["install"], {
    cwd: projectDir,
    stdio: "inherit",
  });

  // Windows can fail direct spawn depending on npm/node/shell setup.
  if (process.platform === "win32" && ["EINVAL", "ENOENT"].includes(direct.error?.code ?? "")) {
    return spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", "npm install"], {
      cwd: projectDir,
      stdio: "inherit",
      windowsHide: true,
    });
  }

  return direct;
}

function installProject(projectName) {
  const projectDir = path.join(repoRoot, projectName);
  const packageJsonPath = path.join(projectDir, "package.json");

  if (!existsSync(packageJsonPath)) {
    console.log(`Skipping ${projectName}: package.json not found.`);
    return;
  }

  console.log(`\nInstalling dependencies in ${projectName}...`);

  const result = runNpmInstall(projectDir);

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

for (const projectName of projects) {
  installProject(projectName);
}

console.log("\nDependency installation complete.");
