# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM node:16.19 as build-stage
WORKDIR /app
RUN git clone -b 354-refactoring-old-executor-task-api-3 https://github.com/golemfactory/yajsapi.git
WORKDIR /app/yajsapi
RUN yarn
RUN yarn build:browser
FROM nginx:1.15
COPY html /usr/share/nginx/html
COPY --from=build-stage /app/yajsapi/examples/web/js/bundle.js /usr/share/nginx/html/js/bundle.js
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80