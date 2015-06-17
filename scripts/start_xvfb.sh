# Start the mock X server
if [ -f /etc/init.d/xvfb ] ; then
    sh -e /etc/init.d/xvfb start
    sleep 2 # sometimes, xvfb takes some time to start up
fi

# Make sure we're connecting to xvfb
export DISPLAY=:99.0
