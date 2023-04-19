# Using Sqlite as your local DB

1. Make sure your ssh config is setup to ssh into client.milmed.ai.
    - Add `CLIENT_MILMED_AI_SSH_CONFIG=client.milmed.ai` to your .env, such that it matchs your ssh config.
2. Run script to pull a copy of the existing database and static files.
    - `./setup_local_dev.sh`
    - This script will convert the dump to sqlite.
    - Uses: https://github.com/dumblob/mysql2sqlite
3. Set sqlite variable in environmental var file.
    - Make sure `DB_PROTOCOL=sqlite3` is in your .env variable.
4. Run the api as you normally would for local development setup.