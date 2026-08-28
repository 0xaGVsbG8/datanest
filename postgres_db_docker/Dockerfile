
FROM postgres:15

RUN apt-get update && apt-get install -y locales \
    && locale-gen pl_PL.UTF-8

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=datanestDB

COPY db_template.sql /docker-entrypoint-initdb.d/db_template.sql
