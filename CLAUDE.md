# Donation Integration Tool (DIT)

## [Conversation History](https://claude.ai/share/e66fd8fc-fb30-440c-b623-37c464624566)

## planned tech-stack
- backend (src): node.js / Typescript / express.js
  - serve dashboard frontend (React)
  - serve browser source for upobs (downloadable in dashboard)
  - third party donation platform
    - ECpay (API)
    - Opay (API)
    - Paypal (API)
  - integration
    - Youtube superchat (v1 API workaround)
    - Twitch (API)
  - database: sqlite3
  - tests: vitest / supertest
- dashboard frontend build: React built to static
- browser source build: vanilla
- all above wrappable to a Docker image
- chrome extension that grabs super chat and send to custom endpoint (serve as backup workaround if API does not work)
- a tutorial to set this all up (mainly for docker on Render)
