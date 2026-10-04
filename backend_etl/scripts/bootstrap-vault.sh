#!/usr/bin/env bash

# bootstrap-vault.sh
# Initializes secrets template in the HashiCorp Vault dev server container

set -e

echo "Waiting for HashiCorp Vault to start..."
until curl -s -f http://localhost:8200/v1/sys/health > /dev/null; do
    sleep 1
done

echo "Vault is up and running!"

export VAULT_ADDR="http://localhost:8200"
export VAULT_TOKEN="root"

echo "Enabling KV secrets engine (version 2) at secret/..."
# Vault dev server enables secret/ by default. We check if it exists, if not enable it.
if ! curl -s -H "X-Vault-Token: $VAULT_TOKEN" "$VAULT_ADDR/v1/sys/mounts" | grep -q "secret/"; then
    curl -s -X POST \
        -H "X-Vault-Token: $VAULT_TOKEN" \
        -d '{"type":"kv-v2"}' \
        "$VAULT_ADDR/v1/sys/mounts/secret"
fi

echo "Writing Immersion German configuration secrets template to Vault..."
# We write placeholders. The user must replace these with real Supabase credentials.
curl -s -X POST \
    -H "X-Vault-Token: $VAULT_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "data": {
            "SUPABASE_URL": "https://your-supabase-project.supabase.co",
            "SUPABASE_KEY": "your-supabase-service-role-key",
            "ADMIN_PASSWORD": "your-admin-web-dashboard-password",
            "OLLAMA_MODEL": "llama3:8b-instruct-q4_K_M"
        }
    }' \
    "$VAULT_ADDR/v1/secret/data/immersion-german"

echo ""
echo "=========================================================="
echo "Vault bootstrapped successfully!"
echo "Secrets template written to: secret/data/immersion-german"
echo "=========================================================="
echo "Please update these values by running Vault CLI or editing"
echo "them in the Vault Web UI at http://localhost:8200"
echo "Using root token: root"
echo "=========================================================="
