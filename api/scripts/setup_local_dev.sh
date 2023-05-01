#!/bin/bash
echo "Build local dev setup..."

BASEDIR=$(realpath $(dirname $0))

# import .env variables
DOT_ENV=$(realpath "$BASEDIR/../.env")
echo "Importing $DOT_ENV"
export $( grep -vE "^(#.*|\s*)$" $DOT_ENV )

# Enter client.milmed.ai sql info
echo "Enter your client.milmed.ai mysql login info."
read -p "Username: " username
stty -echo
read -p "Password: " pass
stty echo
printf "\n"

echo "Creating html sync director."
# Static html directory
html=$(realpath "$BASEDIR/../../html")
mkdir $html

echo "Sync contents."
rsync -azP $CLIENT_MILMED_AI_SSH_CONFIG:/var/www/html/static $html

echo "Remove any old sql dump."
sqldump=$html/pathapp.sql
rm $sqldump

echo "Dump remote sql database to local."
ssh $CLIENT_MILMED_AI_SSH_CONFIG mysqldump -u $username -p$pass pathapptest > $sqldump

echo "Converting sql dump to sqlite3 database."
sql2sqlite=$html/temp_pathapp_for_sqlite3.sql
rm $sql2sqlite 
# convert sql dump to clean sqlite script(still sql)
$BASEDIR/mysql2sqlite $sqldump > $sql2sqlite
# using the sqlite3 node module to build database
node $BASEDIR/build_sqlite_db.js

# remove temp file
rm $sql2sqlite

echo "Build local dev setup COMPLETE."