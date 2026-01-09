#!/bin/bash

# 1. Get CSRF Token
COOKIE_JAR="cookies.txt"
curl -c $COOKIE_JAR -s http://localhost:3002/api/auth/csrf > csrf.json
CSRF_TOKEN=$(grep -o '"csrfToken":"[^"]*"' csrf.json | cut -d'"' -f4)

echo "CSRF Token: $CSRF_TOKEN"

# 2. Add CSRF to request
cat > request_final.json <<EOF
{
    "email": "dev@propflow.ai",
    "password": "Sharktank101!",
    "redirect": false,
    "csrfToken": "$CSRF_TOKEN",
    "callbackUrl": "/dashboard"
}
EOF

# 3. Perform Login
echo "Attempting login..."
curl -v -b $COOKIE_JAR -c $COOKIE_JAR \
    -X POST \
    -H "Content-Type: application/json" \
    -d @request_final.json \
    http://localhost:3002/api/auth/signin/credentials
