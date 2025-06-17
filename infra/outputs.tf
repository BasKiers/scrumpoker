output "pages_project_name" {
  value = cloudflare_pages_project.web_app.name
}

output "pages_project_url" {
  description = "The URL of the Cloudflare Pages project"
  value       = "https://${cloudflare_pages_project.web_app.name}.pages.dev"
}

output "pages_project_subdomain" {
  description = "The subdomain of the Pages project"
  value       = cloudflare_pages_project.web_app.subdomain
}

output "pages_project_id" {
  description = "The ID of the Cloudflare Pages project"
  value       = cloudflare_pages_project.web_app.id
}

output "custom_domain_url" {
  description = "The custom domain URL for the Pages project"
  value       = var.enable_custom_domain ? "https://${var.custom_domain}" : null
}
