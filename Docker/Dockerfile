FROM reg-cnsh-nf.cloud.alipay.com/meugivcn/antcloud-fas-runtime-base:2019022601

# Switch to root, Do something..
USER root

## install nodejs
RUN curl -sL https://rpm.nodesource.com/setup_10.x | bash -
RUN touch /var/lib/rpm/* && yum install -y tzdata nodejs; yum clean all

## copy script
ADD entrypoint.sh /home/admin
RUN chmod +x /home/admin/entrypoint.sh

# Switch back to admin so that user code is run with less privilege
USER admin

ENV NODE_ENV=production

## TODO: ADD the code built by `build.sh`
## add xxx.js /home/admin
ADD /out/index.js /home/admin

## specify the workdir, xxx.js dir
WORKDIR /home/admin

CMD ["/home/admin/entrypoint.sh"]


