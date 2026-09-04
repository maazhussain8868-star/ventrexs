param(
    [string]$SourcePath = "public/logo.png"
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $SourcePath)) {
    Write-Host "Source logo file not found at: $SourcePath" -ForegroundColor Red
    exit 1
}

Write-Host "Processing logo from: $SourcePath" -ForegroundColor Cyan

$srcImg = [System.Drawing.Image]::FromFile((Resolve-Path $SourcePath))

function Resize-Image {
    param(
        [System.Drawing.Image]$Image,
        [int]$Width,
        [int]$Height,
        [string]$DestinationPath
    )

    $bitmap = New-Object System.Drawing.Bitmap $Width, $Height
    $bitmap.SetResolution($Image.HorizontalResolution, $Image.VerticalResolution)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # Calculate centered aspect ratio
    $ratioX = $Width / $Image.Width
    $ratioY = $Height / $Image.Height
    $ratio = [Math]::Min($ratioX, $ratioY)

    $newWidth = [int]($Image.Width * $ratio)
    $newHeight = [int]($Image.Height * $ratio)
    $posX = [int](($Width - $newWidth) / 2)
    $posY = [int](($Height - $newHeight) / 2)

    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.DrawImage($Image, $posX, $posY, $newWidth, $newHeight)
    $graphics.Dispose()

    $bitmap.Save($DestinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    Write-Host "Generated: $DestinationPath ($($Width)x$($Height))" -ForegroundColor Green
}

# 1. Generate PNG icon variants
Resize-Image -Image $srcImg -Width 180 -Height 180 -DestinationPath "public/apple-touch-icon.png"
Resize-Image -Image $srcImg -Width 192 -Height 192 -DestinationPath "public/icon-192.png"
Resize-Image -Image $srcImg -Width 512 -Height 512 -DestinationPath "public/icon-512.png"
Resize-Image -Image $srcImg -Width 32 -Height 32 -DestinationPath "public/favicon-32x32.png"
Resize-Image -Image $srcImg -Width 16 -Height 16 -DestinationPath "public/favicon-16x16.png"

# 2. Generate multi-size favicon.ico
# Create a 32x32 bitmap and save as ICO
$icoBitmap = New-Object System.Drawing.Bitmap 32, 32
$icoGraphics = [System.Drawing.Graphics]::FromImage($icoBitmap)
$icoGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$icoGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$icoGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$icoGraphics.Clear([System.Drawing.Color]::Transparent)

$ratio = [Math]::Min(32 / $srcImg.Width, 32 / $srcImg.Height)
$w = [int]($srcImg.Width * $ratio)
$h = [int]($srcImg.Height * $ratio)
$x = [int]((32 - $w) / 2)
$y = [int]((32 - $h) / 2)

$icoGraphics.DrawImage($srcImg, $x, $y, $w, $h)
$icoGraphics.Dispose()

$hIcon = $icoBitmap.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fileStream = New-Object System.IO.FileStream "public/favicon.ico", ([System.IO.FileMode]::Create)
$icon.Save($fileStream)
$fileStream.Close()

# Also copy to src/app/favicon.ico for Next.js App Router root icon
Copy-Item "public/favicon.ico" "src/app/favicon.ico" -Force

$icoBitmap.Dispose()
$srcImg.Dispose()

Write-Host "All favicon and touch icon variants generated successfully!" -ForegroundColor Cyan
