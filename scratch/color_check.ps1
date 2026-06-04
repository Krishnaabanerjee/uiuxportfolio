Add-Type -AssemblyName System.Drawing
$folder = "c:\Users\baner\Downloads\Antigravity\assets\Photography"
$files = Get-ChildItem $folder -Filter "*.jpg" | Sort-Object Name

foreach ($file in $files) {
    $img = New-Object System.Drawing.Bitmap($file.FullName)
    
    # Sample pixels in a grid to calculate average color
    $sumR = 0
    $sumG = 0
    $sumB = 0
    $count = 0
    
    $stepX = [math]::Max(1, [int]($img.Width / 20))
    $stepY = [math]::Max(1, [int]($img.Height / 20))
    
    for ($x = 0; $x -lt $img.Width; $x += $stepX) {
        for ($y = 0; $y -lt $img.Height; $y += $stepY) {
            $pixel = $img.GetPixel($x, $y)
            $sumR += $pixel.R
            $sumG += $pixel.G
            $sumB += $pixel.B
            $count++
        }
    }
    
    $avgR = [math]::Round($sumR / $count, 1)
    $avgG = [math]::Round($sumG / $count, 1)
    $avgB = [math]::Round($sumB / $count, 1)
    
    Write-Host "$($file.Name): R=$avgR, G=$avgG, B=$avgB (Brightness: $( [math]::Round(($avgR+$avgG+$avgB)/3, 1) ))"
    $img.Dispose()
}
