FROM ubuntu:22.04
RUN apt-get update \
    && apt-get install -y wget \
    && rm -rf /var/lib/apt/lists/* \
    && wget https://github.com/golemfactory/yagna/releases/download/v0.12.0/golem-requestor-linux-v0.12.0.tar.gz -O /golem-requestor-linux.tar.gz \
    && tar -xf /golem-requestor-linux.tar.gz -C / \
    && mv /golem-requestor-linux*/* /usr/bin/ \
    && rm /golem-requestor-linux.tar.gz \
    && rmdir /golem-requestor-linux*
CMD ["/usr/bin/yagna", "service", "run"]