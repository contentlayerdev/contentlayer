#! /bin/bash

rm -rf ./src/{components,layouts,sass,utils,pages} ./public/

cp -r ../playground-azimuth/src/{components,layouts,sass,utils,pages} ./src/
cp -r ../playground-azimuth/public ./
cp -r ../playground-azimuth/next-env.d.ts ./