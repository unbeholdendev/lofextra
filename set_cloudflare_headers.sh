#!/bin/bash

echo "creating _headers file for cloudflare deployment"

cat > ./out/_headers <<EOF
/*
  cross-origin-embedder-policy: require-corp
  cross-origin-opener-policy: same-origin
EOF

echo "_header file success"