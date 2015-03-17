#!/usr/bin/env bash

git clone https://github.com/mapbox/mason.git .mason
PATH=`pwd`/.mason:$PATH
export MASON_DIR=`pwd`/.mason
