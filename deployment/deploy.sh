#!/usr/bin/env bash

./deployment/build_image.sh;

echo "Image built - configuring service";

gcloud alpha run deploy api \
  --image gcr.io/tokenlandia-admin/api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

  # Default
  # --concurrency=80
  # --memory=256Mi
