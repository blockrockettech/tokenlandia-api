#!/usr/bin/env bash

echo "Building image ... ";

gcloud config set project tokenlandia-admin;

gcloud builds submit --tag gcr.io/tokenlandia-admin/api;