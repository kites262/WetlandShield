#!/bin/sh
set -eu

node /srv/server/dist/main.js &
server_pid="$!"

caddy run --config /etc/caddy/Caddyfile --adapter caddyfile &
caddy_pid="$!"

cleanup() {
  kill "$server_pid" 2>/dev/null || true
  kill "$caddy_pid" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

while kill -0 "$server_pid" 2>/dev/null && kill -0 "$caddy_pid" 2>/dev/null; do
  sleep 1
done

exit 1
