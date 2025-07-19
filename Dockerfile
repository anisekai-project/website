FROM node:lts AS build

ARG namespace="anisekai-project"
ARG project="website"
ARG branch="main"

WORKDIR /source
RUN git clone https://github.com/$namespace/$project.git && \
    cd $project &&  \
    git checkout $branch && \
    yarn install && \
    yarn build

FROM node:lts AS service

ARG project="website"

WORKDIR /app

COPY --from=build /source/$project/.output .

ENTRYPOINT ["node", "server/index.mjs"]
