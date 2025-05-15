output "pages_project_name" {
  value = cloudflare_pages_project.web_app.name
}

output "pages_project_url" {
  value = cloudflare_pages_project.web_app.production_url
}
