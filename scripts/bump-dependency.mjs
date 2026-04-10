import { execSync } from "node:child_process";
import path from "node:path";

const services = ["auth", "tickets"]; // add "orders", "payments" later

function run(cmd, cwd) {
  execSync(cmd, { stdio: "inherit", cwd });
}

for (const svc of services) {
  const cwd = path.resolve(svc);
  console.log(`\n== Updating @ccgtickets/common in ${svc} ==`);
  run("npm i @ccgtickets/common@latest", cwd);
}
console.log("\nDone. Commit the updated package-lock.json files.");