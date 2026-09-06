# PowerShell script to generate placeholder PWA screenshots for Ventrexs AI
Add-Type -AssemblyName System.Drawing

$destDir = "public/screenshots"
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$logoPath = "public/logo.png"
$hasLogo = Test-Path $logoPath
$logoImg = $null
if ($hasLogo) {
    $logoImg = [System.Drawing.Image]::FromFile((Resolve-Path $logoPath))
}

function Create-MobileScreenshot {
    param(
        [string]$Path,
        [string]$Title,
        [string]$Subtitle
    )

    $width = 1080
    $height = 1920
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background gradient
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point(0, $height)),
        [System.Drawing.ColorTranslator]::FromHtml("#070B14"),
        [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
    )
    $g.FillRectangle($bgBrush, 0, 0, $width, $height)
    $bgBrush.Dispose()

    # Top Status Bar placeholder
    $statusBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#1E293B"))
    $g.FillRectangle($statusBrush, 60, 60, $width - 120, 10)
    $statusBrush.Dispose()

    # Draw App Logo
    if ($logoImg -ne $null) {
        $logoSize = 180
        $logoX = [int](($width - $logoSize) / 2)
        $g.DrawImage($logoImg, $logoX, 160, $logoSize, $logoSize)
    }

    # Typography
    $titleFont = New-Object System.Drawing.Font("Arial", 42, [System.Drawing.FontStyle]::Bold)
    $subFont = New-Object System.Drawing.Font("Arial", 26, [System.Drawing.FontStyle]::Regular)
    $labelFont = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Bold)

    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $grayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#94A3B8"))
    $blueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#3B82F6"))

    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center

    $g.DrawString($Title, $titleFont, $whiteBrush, ($width / 2), 380, $format)
    $g.DrawString($Subtitle, $subFont, $grayBrush, ($width / 2), 460, $format)

    # Mock Cards / Widgets
    $cardBg = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#131D31"))
    $cardPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#223354"), 2)

    # Metric Card 1
    $g.FillRectangle($cardBg, 80, 560, $width - 160, 240)
    $g.DrawRectangle($cardPen, 80, 560, $width - 160, 240)
    $g.DrawString("AI Receptionist & Booking Agent", $labelFont, $blueBrush, 120, 600)
    $g.DrawString("99.4% Automated Response Rate | 24/7 Live Intake", $subFont, $whiteBrush, 120, 650)
    $g.DrawString("Active Leads Handled: 1,420+", $labelFont, $grayBrush, 120, 720)

    # Metric Card 2
    $g.FillRectangle($cardBg, 80, 840, $width - 160, 240)
    $g.DrawRectangle($cardPen, 80, 840, $width - 160, 240)
    $g.DrawString("Field Operations & Smart CRM", $labelFont, $blueBrush, 120, 880)
    $g.DrawString("Real-time Job Scheduling & Team Dispatch", $subFont, $whiteBrush, 120, 930)
    $g.DrawString("Completed Jobs: $48,250 MTD", $labelFont, $grayBrush, 120, 1000)

    # Metric Card 3
    $g.FillRectangle($cardBg, 80, 1120, $width - 160, 240)
    $g.DrawRectangle($cardPen, 80, 1120, $width - 160, 240)
    $g.DrawString("Payments & Invoicing Automation", $labelFont, $blueBrush, 120, 1160)
    $g.DrawString("Zero-fee Instant Payouts & Automated Billing", $subFont, $whiteBrush, 120, 1210)
    $g.DrawString("Collection Rate: 98.2%", $labelFont, $grayBrush, 120, 1280)

    # Bottom navigation bar
    $navBg = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#0B132B"))
    $g.FillRectangle($navBg, 0, $height - 180, $width, 180)
    $g.DrawRectangle($cardPen, 0, $height - 180, $width, 180)
    $g.DrawString("Dashboard      Messages      Schedule      Billing      Settings", $labelFont, $grayBrush, ($width / 2), ($height - 100), $format)

    $format.Dispose()
    $navBg.Dispose()
    $cardPen.Dispose()
    $cardBg.Dispose()
    $blueBrush.Dispose()
    $grayBrush.Dispose()
    $whiteBrush.Dispose()
    $labelFont.Dispose()
    $subFont.Dispose()
    $titleFont.Dispose()
    $g.Dispose()

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated mobile screenshot: $Path (1080x1920)" -ForegroundColor Green
}

function Create-DesktopScreenshot {
    param(
        [string]$Path,
        [string]$Title,
        [string]$Subtitle
    )

    $width = 1920
    $height = 1080
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point($width, $height)),
        [System.Drawing.ColorTranslator]::FromHtml("#070B14"),
        [System.Drawing.ColorTranslator]::FromHtml("#0F172A")
    )
    $g.FillRectangle($bgBrush, 0, 0, $width, $height)
    $bgBrush.Dispose()

    # Sidebar
    $sidebarBg = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#0B132B"))
    $g.FillRectangle($sidebarBg, 0, 0, 320, $height)
    $sidebarBg.Dispose()

    # Draw Logo in Sidebar
    if ($logoImg -ne $null) {
        $g.DrawImage($logoImg, 50, 40, 80, 80)
    }

    $titleFont = New-Object System.Drawing.Font("Arial", 36, [System.Drawing.FontStyle]::Bold)
    $sectionFont = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
    $bodyFont = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Regular)

    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $grayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#94A3B8"))
    $blueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#3B82F6"))

    $g.DrawString("Ventrexs AI", $sectionFont, $whiteBrush, 145, 62)

    # Sidebar links
    $links = @("Dashboard", "AI Receptionist", "CRM & Leads", "Job Calendar", "Invoicing", "Reputation", "Analytics", "Settings")
    $y = 180
    foreach ($link in $links) {
        $brush = if ($link -eq "Dashboard") { $blueBrush } else { $grayBrush }
        $g.DrawString($link, $bodyFont, $brush, 50, $y)
        $y += 65
    }

    # Main content header
    $g.DrawString($Title, $titleFont, $whiteBrush, 380, 50)
    $g.DrawString($Subtitle, $bodyFont, $grayBrush, 380, 115)

    # 4 Metric Cards across the top
    $cardBg = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#131D31"))
    $cardPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#223354"), 2)

    $cards = @(
        @{ Title = "Total Revenue"; Val = "$128,450"; Sub = "+24.8% vs last month" },
        @{ Title = "Inbound AI Calls"; Val = "3,482"; Sub = "99.1% resolved without human" },
        @{ Title = "Active Dispatch Jobs"; Val = "42"; Sub = "18 technicians on field" },
        @{ Title = "5-Star Reviews"; Val = "4.9 / 5.0"; Sub = "+182 reviews this quarter" }
    )

    $cardW = 340
    $cardH = 160
    $startX = 380
    for ($i = 0; $i -lt 4; $i++) {
        $cx = $startX + ($i * ($cardW + 30))
        $g.FillRectangle($cardBg, $cx, 180, $cardW, $cardH)
        $g.DrawRectangle($cardPen, $cx, 180, $cardW, $cardH)

        $g.DrawString($cards[$i].Title, $bodyFont, $grayBrush, ($cx + 20), 205)
        $g.DrawString($cards[$i].Val, $titleFont, $whiteBrush, ($cx + 20), 240)
        $g.DrawString($cards[$i].Sub, $bodyFont, $blueBrush, ($cx + 20), 295)
    }

    # Big Command Center Chart / Activity Area
    $g.FillRectangle($cardBg, 380, 380, 960, 620)
    $g.DrawRectangle($cardPen, 380, 380, 960, 620)
    $g.DrawString("Live Business Operations & Intelligence", $sectionFont, $whiteBrush, 410, 410)
    $g.DrawString("Real-time telemetry across calls, lead conversions, job dispatches and payments", $bodyFont, $grayBrush, 410, 450)

    # Live Feed panel
    $g.FillRectangle($cardBg, 1370, 380, 480, 620)
    $g.DrawRectangle($cardPen, 1370, 380, 480, 620)
    $g.DrawString("Recent Automated Actions", $sectionFont, $whiteBrush, 1400, 410)
    $g.DrawString("AI scheduled: Emergency HVAC inspection", $bodyFont, $grayBrush, 1400, 470)
    $g.DrawString("Payment collected: $1,250 via PayPilot", $bodyFont, $blueBrush, 1400, 520)
    $g.DrawString("Call resolved: Booking confirmed (Maaz H.)", $bodyFont, $grayBrush, 1400, 570)
    $g.DrawString("Review received: 5-stars on Google Maps", $bodyFont, $blueBrush, 1400, 620)
    $g.DrawString("Dispatch route optimized for Tech #3", $bodyFont, $grayBrush, 1400, 670)

    $cardPen.Dispose()
    $cardBg.Dispose()
    $blueBrush.Dispose()
    $grayBrush.Dispose()
    $whiteBrush.Dispose()
    $bodyFont.Dispose()
    $sectionFont.Dispose()
    $titleFont.Dispose()
    $g.Dispose()

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated desktop screenshot: $Path (1920x1080)" -ForegroundColor Green
}

Create-MobileScreenshot -Path "public/screenshots/mobile-dashboard.png" -Title "Ventrexs AI Operating System" -Subtitle "Mobile Command & Dispatch"
Create-MobileScreenshot -Path "public/screenshots/mobile-crm.png" -Title "Smart CRM & AI Reception" -Subtitle "Automated Client Engagements"
Create-DesktopScreenshot -Path "public/screenshots/desktop-dashboard.png" -Title "Operations Command Center" -Subtitle "Enterprise AI Management Platform for Modern Service Businesses"

# Mirror to ventrexs/public/screenshots if it exists
if (Test-Path "ventrexs/public") {
    $ventrexsScreenshots = "ventrexs/public/screenshots"
    if (-not (Test-Path $ventrexsScreenshots)) {
        New-Item -ItemType Directory -Path $ventrexsScreenshots -Force | Out-Null
    }
    Copy-Item "public/screenshots/*" $ventrexsScreenshots -Force
    Write-Host "Mirrored screenshots to ventrexs/public/screenshots" -ForegroundColor Cyan
}

if ($logoImg -ne $null) {
    $logoImg.Dispose()
}

Write-Host "All PWA screenshots generated successfully!" -ForegroundColor Cyan
