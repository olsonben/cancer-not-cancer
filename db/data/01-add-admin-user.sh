#!/bin/bash

echo "Insert initial pathapp admin user."

# Run SQL command to insert data directly into the database
mariadb -u"root" -p"$MARIADB_ROOT_PASSWORD"  "$MARIADB_DATABASE" <<EOF
INSERT INTO users (id, fullname, username, password, is_enabled, is_pathologist, is_uploader, is_admin)
VALUES
(1,'Admin','$ADMIN_EMAIL','pass',1,1,1,1);
EOF

echo "Custom data inserted successfully."
