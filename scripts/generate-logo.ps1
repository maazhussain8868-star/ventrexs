$code = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public class LogoGenerator
{
    public static void Generate(string outputPath)
    {
        int width = 512;
        int height = 512;
        using (Bitmap bmp = new Bitmap(width, height))
        {
            using (Graphics g = Graphics.FromImage(bmp))
            {
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.Clear(Color.Transparent);

                // 1. Outer rounded rectangle
                using (GraphicsPath path = new GraphicsPath())
                {
                    int r = 100;
                    int d = r * 2;
                    Rectangle rect = new Rectangle(8, 8, width - 16, height - 16);
                    path.AddArc(rect.X, rect.Y, d, d, 180, 90);
                    path.AddArc(rect.Right - d, rect.Y, d, d, 270, 90);
                    path.AddArc(rect.Right - d, rect.Bottom - d, d, d, 0, 90);
                    path.AddArc(rect.X, rect.Bottom - d, d, d, 90, 90);
                    path.CloseFigure();

                    using (LinearGradientBrush bgBrush = new LinearGradientBrush(
                        new Point(0, 0),
                        new Point(width, height),
                        ColorTranslator.FromHtml("#0a1020"),
                        ColorTranslator.FromHtml("#050812")))
                    {
                        g.FillPath(bgBrush, path);
                    }

                    using (Pen borderPen = new Pen(ColorTranslator.FromHtml("#1e293b"), 8))
                    {
                        g.DrawPath(borderPen, path);
                    }
                }

                // 2. Inner card
                using (GraphicsPath innerPath = new GraphicsPath())
                {
                    int ir = 72;
                    int id = ir * 2;
                    Rectangle innerRect = new Rectangle(76, 76, 360, 360);
                    innerPath.AddArc(innerRect.X, innerRect.Y, id, id, 180, 90);
                    innerPath.AddArc(innerRect.Right - id, innerRect.Y, id, id, 270, 90);
                    innerPath.AddArc(innerRect.Right - id, innerRect.Bottom - id, id, id, 0, 90);
                    innerPath.AddArc(innerRect.X, innerRect.Bottom - id, id, id, 90, 90);
                    innerPath.CloseFigure();

                    using (SolidBrush innerBrush = new SolidBrush(Color.FromArgb(180, 15, 23, 42)))
                    {
                        g.FillPath(innerBrush, innerPath);
                    }

                    using (Pen innerPen = new Pen(Color.FromArgb(100, 59, 130, 246), 4))
                    {
                        g.DrawPath(innerPen, innerPath);
                    }
                }

                // 3. Lightning bolt
                using (GraphicsPath boltPath = new GraphicsPath())
                {
                    PointF[] points = new PointF[]
                    {
                        new PointF(280, 64),
                        new PointF(100, 280),
                        new PointF(260, 280),
                        new PointF(240, 448),
                        new PointF(420, 232),
                        new PointF(260, 232),
                        new PointF(280, 64)
                    };
                    boltPath.AddPolygon(points);

                    using (LinearGradientBrush boltBrush = new LinearGradientBrush(
                        new Point(100, 64),
                        new Point(420, 448),
                        ColorTranslator.FromHtml("#38bdf8"),
                        ColorTranslator.FromHtml("#4f46e5")))
                    {
                        g.FillPath(boltBrush, boltPath);
                    }
                }
            }
            bmp.Save(outputPath, ImageFormat.Png);
        }
    }
}
"@

Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
[LogoGenerator]::Generate("c:\Users\MUNAWAR\OneDrive\Desktop\PayPilot AI\public\logo.png")
Write-Host "Generated public/logo.png successfully" -ForegroundColor Green
