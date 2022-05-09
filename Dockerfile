FROM node:14

WORKDIR /myfolder/
COPY ./package.json /myfolder/
COPY ./yarn.lock /myfolder/
RUN yarn install

COPY . /myfolder/
CMD yarn start:dev