#!/bin/bash

echo "🔧 Starting Minio bucket setup..."

mc alias set minio http://minio:9000 minioadmin b19428f458848b7a98a498591f54d595

max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if mc admin info minio >/dev/null 2>&1; then
    break
  fi
  attempt=$((attempt + 1))
  echo "   Attempt $attempt/$max_attempts - Minio not ready yet, retrying in 3 seconds..."
  sleep 3
done

if [ $attempt -eq $max_attempts ]; then
  exit 1
fi

mc ls minio/ || echo "No buckets found"

if mc ls minio/micro-srv-test > /dev/null 2>&1; then
  echo "📁 Bucket 'micro-srv-test' already exists"
else
  mc mb minio/micro-srv-test
fi

mc anonymous set public minio/micro-srv-test
mc ls minio/micro-srv-test || echo "Bucket is empty"
mc anonymous get minio/micro-srv-test

sleep 5

echo "✅ Setup complete, container will exit"
