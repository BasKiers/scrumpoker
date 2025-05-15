terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 4.0.0"
    }
  }
  required_version = ">= 1.2"
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_pages_project" "web_app" {
  account_id        = var.cloudflare_account_id
  name              = var.project_name
  production_branch = var.production_branch
  build_config {
    build_command   = "pnpm run build"
    destination_dir = "dist"
    root_dir        = "apps/web-app"
  }
  source {
    type = "github"
    config {
      owner = "baskiers" # TODO: Replace with your GitHub org/user
      repo_name = "scrumpoker" # TODO: Replace with your repo name
      production_branch = var.production_branch
    }
  }
}

resource "cloudflare_worker_script" "scrumpoker_api" {
  name       = "scrumpoker-api"
  account_id = var.cloudflare_account_id
  content    = file("${path.module}/../workers/scrumpoker-api/workers/scrumpoker-api/dist/worker.js")
  module     = true
}

# Optionally, add DNS records for custom domain
# resource "cloudflare_record" "web_app" {
#   zone_id = var.cloudflare_zone_id
#   name    = "app"
#   value   = cloudflare_pages_project.web_app.subdomain
#   type    = "CNAME"
#   proxied = true
# }
