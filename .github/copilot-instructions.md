# Project Conventions

- This is a local interview demo using GitHub Actions, AWS ECR, kind, Argo CD, and Argo CD Image Updater.
- Keep the website dependency-free JavaScript on Node.js 22 or newer; use `npm --prefix app test` for HTTP tests.
- Use explicit `kind-interview-demo` context for every mutating kubectl command.
- CI publishes immutable multi-platform images; only Argo CD deploys the application.
- Image Updater v1.0.0 uses an ImageUpdater CR with required spec.namespace and Git write-back into the local Kustomize overlay.
- Do not commit credentials, private keys, or .env; keep configuration placeholders documented in README.md.
- Publish immutable human-readable image versions only from stable vMAJOR.MINOR.PATCH Git tags on main history; preserve workflow path filters and semantic-version selection in Image Updater.
- Validate touched shell/YAML and render Kustomize overlays before reporting infrastructure changes complete.
