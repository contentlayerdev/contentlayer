#! /bin/bash

rm -rf ./web/src/{components,layouts,sass,utils,pages} ./web/public/

cp -r ../playground-azimuth/src/{components,layouts,sass,utils,pages} ./web/src/
cp -r ../playground-azimuth/public ./web/
cp -r ../playground-azimuth/next-env.d.ts ./web/