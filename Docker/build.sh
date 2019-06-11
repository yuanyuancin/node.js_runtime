#!/usr/bin/env bash

tag=`date +"%Y%m%d%H%M%S"`

# TODO: build and copy nodejs runtime here

docker build . -t reg-cnsh-nf.cloud.alipay.com/meugivcn/sofastack-sas-nodejs-runtime:${tag}
docker push reg-cnsh-nf.cloud.alipay.com/meugivcn/sofastack-sas-nodejs-runtime:${tag}

echo reg-cnsh-nf.cloud.alipay.com/meugivcn/sofastack-sas-nodejs-runtime:${tag}
echo reg-cnsh-nf.cloud.alipay.com/meugivcn/sofastack-sas-nodejs-runtime:${tag} > .last-built-image


