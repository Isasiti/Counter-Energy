# Database Dockerfile
FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_DB=myapp
ENV POSTGRES_USER=user
ENV POSTGRES_PASSWORD=password

# Copy initialization scripts (optional)
# COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432