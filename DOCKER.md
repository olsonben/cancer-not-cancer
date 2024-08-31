# Using Docker for local development

#### Contents:
- [Setup](#setup)
- [Usage](#usage)
- [Caveats](#caveats)

This docker compose setup is designed to mimic the production deployment locally. It launches 3 differents services. It launches the api at localhost:3333, mariadb at localhost:3306, and hosts the client with nginx at localhost:3000. You can change nginx settings inside **nginx/conf.d/default.conf**, please restart the docker service to apply changes. Image uploads and database entries are persistent via docker volumes.

## Setup

1. Install [Docker Desktop](https://www.docker.com/)
2. Create environment files
    - **api/.env** - Setup to match docker compose settings and **db/.env**.
        - api ports should be **3333**
        - `DB_USER=root`
        - `DB_PASSWORD=` should match **db/.env** `MARIADB_ROOT_PASSWORD`
        - `DATABASE=` should match **db/.env** `MARIADB_DATABASE`
        - `DB_HOST='db'` db is the name of the mariadb docker service
    - **client/.env.development** - Make sure ports and addresses with ports match docker setup.
    - **db/.env** - variables for initializing the db service
        - **MARIADB_ROOT_PASSWORD** - the password for the root user.
        - **MARIADB_DATABASE** - the default database name
        - **ADMIN_EMAIL** - ***!!IMPORTANT!!*** this will be the first admin user added to the pathapp. It should be an email that can be authenticated with Google OAuth. (without this you will have to add a user manually from the cmd line or with a db editor)
3. Generate client app
    - `cd client`
    - `npm run gen-dev`

## Usage

- `docker compose up` - builds and starts container/services. Add `-d` to detach the process from the terminal console.
- `docker compose down` - will destroy the containers but not the volumes.
- `docker compose down -v` - will destroy all including the volumes. So any database entries and images uploaded will be lost.
- `docker compose restart nginx` - restarts the nginx service


## Caveats

- Docker ports are currently hard-coded.
    - api: **3333**
    - client: **3000**
    - mariadb: **3306**
- Client Builds: the static build from nuxt generate is hosted by mounting the **client/.output/public** folder to the nginx service. Because `npm run gen-dev` deletes and recreates the .output folder, the mount breaks and you will get 404 Not Found for everything. This is simpley fixed by restarting the nginx service with `docker compose restart nginx`