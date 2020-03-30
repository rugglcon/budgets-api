#!/usr/bin/env bash

git pull

npm ci

status=$?
if [ $status -ne 0 ]; then
    echo "something went wrong running npm ci"
    exit 1
fi

# npm run ci

# status=$?
# if [ $status -ne 0 ]; then
#     echo "something went wrong running npm run build"
#     exit 1
# fi

/bin/systemctl restart budget_api.service
