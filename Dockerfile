FROM meteorhacks/meteord:base

COPY ./ /app
COPY .npmrc ~/.npmrc
RUN bash $METEORD_DIR/on_build.sh
