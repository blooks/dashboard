FROM ulexus/meteor
ENV NODE_ENV production
ENV PORT 3000
COPY build /home/meteor/www
RUN chown -R meteor:meteor /home/meteor/www

EXPOSE 3000