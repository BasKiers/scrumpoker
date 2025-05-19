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
  
  build_config = {
    build_command   = "pnpm install && pnpm --filter=web-app... build"
    destination_dir = "apps/web-app/dist"
    root_dir        = "/"
  }

  source = {
    type = "github"
    config = {
      owner             = var.github_owner
      repo_name         = var.github_repo
      production_branch = var.production_branch
    }
  }
}

resource "cloudflare_workers_script" "scrumpoker_api" {
  account_id    = var.cloudflare_account_id
  script_name   = "scrumpoker-api"
  content       = file("${path.module}/../workers/scrumpoker-api/dist/index.js")
  build_command = "pnpm install && pnpm --filter=scrumpoker-api... build"
}

# Optionally, add DNS records for custom domain
# resource "cloudflare_record" "web_app" {
#   count    = var.enable_custom_domain ? 1 : 0
#   zone_id  = var.cloudflare_zone_id
#   name     = var.custom_domain
#   value    = cloudflare_pages_project.web_app.subdomain
#   type     = "CNAME"
#   proxied  = true
# }
