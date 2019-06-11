#!/usr/bin/env bash

./build.sh

docker run  -it -p 8080:8080 \
    -v ${PWD}/logs:/home/admin/logs \
    -v ${PWD}/test-resources/sas/ipc:/home/admin/sas/ipc \
    -v ${PWD}/test-resources/user-code:/home/admin/user-code \
    --env SOFASTACK_SAS_IPC_PATH=/home/admin/sas \
    --env SOFASTACK_SAS_RUNTIME_STATE_DIR=/home/admin/state \
    $(cat .last-built-image)
