Add-Type -AssemblyName System.Drawing
$folder = "c:\Users\baner\Downloads\Antigravity\assets\Photography"
$files = Get-ChildItem $folder -Filter "*.jpg" | Sort-Object Name

foreach ($file in $files) {
    $img = [System.Drawing.Image]::FromFile($file.FullName)
    $w = $img.Width
    $h = $img.Height
    $ratio = [math]::Round($w / $h, 3)
    Write-Host "$($file.Name): $($w)x$($h) (ratio: $ratio)"
    $img.Dispose()
}
