variable "cloudflare_api_token" {
  description = "Cloudflare API token with Pages and DNS permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for your domain"
  type        = string
}

variable "project_name" {
  description = "Name of the Cloudflare Pages project"
  type        = string
  default     = "web-app"
}

variable "production_branch" {
  description = "Production branch for Pages deployment"
  type        = string
  default     = "main"
}

variable "github_owner" {
  description = "GitHub organization or username"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
}

variable "enable_custom_domain" {
  description = "Whether to enable custom domain"
  type        = bool
  default     = false
}

variable "custom_domain" {
  description = "Custom domain name for the application"
  type        = string
  default     = ""
}
