# Export Marp slides from WSL

When exporting the Marp deck to PowerPoint from WSL, `npx @marp-team/marp-cli ... --pptx` may fail because Marp needs a browser for PDF/PPTX/image conversion and WSL does not automatically detect Firefox installed on Windows.

Use the official Marp Docker image instead. It includes the browser/runtime needed for conversion and works from the repo root.

```bash
docker run --rm --init \
  -v "$PWD:/home/marp/app" \
  -e MARP_USER="$(id -u):$(id -g)" \
  marpteam/marp-cli \
  docs/ticketing-app-aws-k3s-presentation.marp.md --pptx
```

This writes the output next to the source deck:

```text
docs/ticketing-app-aws-k3s-presentation.marp.pptx
```

## Prerequisites

- Docker Desktop is running on Windows.
- Docker Desktop WSL integration is enabled for the distro.
- Run the command from the project root.

## Optional alternative

Install Chrome or Chromium inside WSL and tell Marp to use it:

```bash
npx @marp-team/marp-cli docs/ticketing-app-aws-k3s-presentation.marp.md \
  --pptx --browser chrome
```

The Docker command is the recommended option because it avoids depending on a browser installed inside WSL.
