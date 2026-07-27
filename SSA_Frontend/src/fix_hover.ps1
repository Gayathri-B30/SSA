$dir = "d:\SSA\SSA_Frontend\src\pages"
$files = Get-ChildItem -Path $dir -Filter "*.tsx"
foreach ($file in $files) {
  $content = Get-Content -Path $file.FullName -Raw
  $updated = $content.Replace("hover:text-brand-charcoal hover:bg-slate-800", "hover:text-brand-charcoal hover:bg-slate-100")
  if ($content -ne $updated) {
    Set-Content -Path $file.FullName -Value $updated -NoNewline
    Write-Output ("Fixed: " + $file.Name)
  }
}
$layoutDir = "d:\SSA\SSA_Frontend\src\layouts"
$layoutFiles = Get-ChildItem -Path $layoutDir -Filter "*.tsx"
foreach ($file in $layoutFiles) {
  $content = Get-Content -Path $file.FullName -Raw
  $updated = $content.Replace("hover:text-brand-charcoal hover:bg-slate-800", "hover:text-brand-charcoal hover:bg-slate-100")
  if ($content -ne $updated) {
    Set-Content -Path $file.FullName -Value $updated -NoNewline
    Write-Output ("Fixed layout: " + $file.Name)
  }
}
Write-Output "Done"
