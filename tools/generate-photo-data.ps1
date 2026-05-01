$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$photoDir = Join-Path $root "Nosotros"
$outFile = Join-Path $root "fotos-data.js"
$extensions = @(".jpg", ".jpeg", ".png", ".webp", ".gif")

Add-Type -AssemblyName System.Drawing

function Get-ExifDate {
  param([string]$Path)

  $stream = $null
  $image = $null

  try {
    $stream = [System.IO.File]::Open($Path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
    $image = [System.Drawing.Image]::FromStream($stream, $false, $false)
    $datePropertyIds = @(36867, 36868, 306)

    foreach ($id in $datePropertyIds) {
      if ($image.PropertyIdList -contains $id) {
        $property = $image.GetPropertyItem($id)
        $raw = [System.Text.Encoding]::ASCII.GetString($property.Value).Trim([char]0).Trim()

        if ($raw -match "^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$") {
          return [datetime]::ParseExact($raw, "yyyy:MM:dd HH:mm:ss", [System.Globalization.CultureInfo]::InvariantCulture)
        }
      }
    }
  }
  catch {
    return $null
  }
  finally {
    if ($image) { $image.Dispose() }
    if ($stream) { $stream.Dispose() }
  }

  return $null
}

function Convert-ToWebPath {
  param([string]$FullPath)

  $rootUri = [System.Uri]::new(($root.TrimEnd("\") + "\"))
  $fileUri = [System.Uri]::new($FullPath)
  $relative = [System.Uri]::UnescapeDataString($rootUri.MakeRelativeUri($fileUri).ToString())
  return ($relative -replace "\\", "/")
}

function Format-SpanishDate {
  param([datetime]$Date)

  $culture = [System.Globalization.CultureInfo]::GetCultureInfo("es-CL")
  return $Date.ToString("dd 'de' MMMM 'de' yyyy", $culture)
}

$items = Get-ChildItem -Path $photoDir -File |
  Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() } |
  ForEach-Object {
    $exifDate = Get-ExifDate -Path $_.FullName
    $date = if ($exifDate) { $exifDate } else { $_.LastWriteTime }
    $source = if ($exifDate) { "EXIF" } else { "Archivo" }

    [pscustomobject]@{
      src = Convert-ToWebPath -FullPath $_.FullName
      name = $_.Name
      dateIso = $date.ToString("yyyy-MM-ddTHH:mm:ss")
      dateKey = $date.ToString("yyyy-MM-dd")
      dateLabel = Format-SpanishDate -Date $date
      source = $source
    }
  } |
  Sort-Object dateIso, name

$json = $items | ConvertTo-Json -Depth 4
$content = "window.PHOTO_ITEMS = $json;`n"
[System.IO.File]::WriteAllText($outFile, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "Generated $($items.Count) photos in $outFile"
