#!/usr/bin/env bash

apt-get install mongodb -y

cd /vagrant

mongo localhost:27017/uwc-vi-final loadmongo.js

wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.17.2/install.sh | bash

export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

nvm install 0.10.33

nohup node index.js 0<&- &>/dev/null &