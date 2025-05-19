output "pages_project_name" {
  value = cloudflare_pages_project.web_app.name
}

output "pages_project_url" {
  description = "The URL of the deployed Pages project"
  value       = cloudflare_pages_project.web_app.url
}

output "pages_project_subdomain" {
  description = "The subdomain of the Pages project"
  value       = cloudflare_pages_project.web_app.subdomain
}
