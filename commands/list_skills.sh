#!/bin/bash
# List available skills in the skills directory

if [ ! -d "skills" ]; then
    echo "No 'skills' directory found."
    exit 0
fi

echo "=== Available Neo Skills ==="
ls -1 skills/ | sed 's/^/- /'
