FROM mysql:8.0
COPY my.cnf /etc/mysql/conf.d/replication.cnf
RUN chmod 644 /etc/mysql/conf.d/replication.cnf
COPY init-replication-user.sh /docker-entrypoint-initdb.d/init-replication-user.sh
RUN chmod 755 /docker-entrypoint-initdb.d/init-replication-user.sh
