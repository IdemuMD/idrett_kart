#!/bin/bash
# Quick MongoDB install & config for VM 10.12.2.231 (Ubuntu/Debian)

set -e

echo "Installing MongoDB on Ubuntu/Debian..."

# Add MongoDB repo
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt-get update
sudo apt-get install -y mongodb-org

# Start & enable
sudo systemctl start mongod
sudo systemctl enable mongod

# Config for remote access (10.12.2.230 only)
sudo sed -i "s/bindIp: 127.0.0.1/bindIp: 127.0.0.1,10.12.2.231/" /etc/mongod.conf
sudo sed -i "s/#security:/security:\n  authorization: enabled/" /etc/mongod.conf

sudo systemctl restart mongod

# Create idrett_kart DB & admin user
mongosh <<EOF
use admin
db.createUser({
  user: "admin",
  pwd: "mongo123",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

use idrett_kart
db.createUser({
  user: "idrett",
  pwd: "kart123",
  roles: ["readWrite"]
})
EOF

echo "MongoDB ready!"
echo "Connection: mongodb://idrett:kart123@10.12.2.231:27017/idrett_kart?authSource=idrett_kart"
echo "Admin: mongodb://admin:mongo123@10.12.2.231:27017/admin"
echo "Test: mongosh 'mongodb://idrett:kart123@10.12.2.231:27017/idrett_kart?authSource=idrett_kart'"
echo "Firewall: sudo ufw allow from 10.12.2.230 to any port 27017"
