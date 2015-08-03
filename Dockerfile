FROM meteorhacks/meteord:base

COPY ./ /app
COPY .npmrc /root/.npmrc
RUN npm config list
RUN bash $METEORD_DIR/on_build.sh
RUN rm /root/.npmrc