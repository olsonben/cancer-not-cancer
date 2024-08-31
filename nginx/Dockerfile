FROM nginx:latest

COPY ./nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

COPY ./client/.output/public /usr/share/nginx.html

EXPOSE 3000