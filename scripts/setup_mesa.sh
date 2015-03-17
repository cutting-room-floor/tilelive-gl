#!/usr/bin/env bash

set -e
set -o pipefail

export DISPLAY=:99.0

sh -e /etc/init.d/xvfb start

sudo apt-get update -y

# install OpenGL
sudo apt-get -y install mesa-utils libxi-dev x11proto-randr-dev \
                        x11proto-xext-dev libxrandr-dev \
                        x11proto-xf86vidmode-dev libxxf86vm-dev \
                        libxcursor-dev libxinerama-dev \
                        llvm-3.4 # required for mesa

# install mason
source ./scripts/install_mason.sh

# install mesa
mason install mesa ${MESA_VERSION}

export LD_LIBRARY_PATH=`mason prefix mesa ${MESA_VERSION}`/lib:${LD_LIBRARY_PATH};
glxinfo;
