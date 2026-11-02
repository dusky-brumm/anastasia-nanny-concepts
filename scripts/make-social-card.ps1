#requires -Version 7
param([string]$OutputPath = (Join-Path $PSScriptRoot '../src/reference/assets/social-card.png'))
Add-Type -AssemblyName System.Drawing
$cardFonts = [System.Drawing.Text.PrivateFontCollection]::new()
$cardFonts.AddFontFile([System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../src/reference/fonts/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk7PFO_F.ttf')))
$cardImage = [System.Drawing.Bitmap]::new(1200,630)
$cardGraphics = [System.Drawing.Graphics]::FromImage($cardImage)
$cardGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$cardGraphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$cardPaper = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#faf6ec'))
$cardWash = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#e4edf1'))
$cardInk = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#294c3e'))
$cardMuted = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#426a80'))
$cardLine = [System.Drawing.Pen]::new($cardMuted.Color,3)
$cardGraphics.FillRectangle($cardPaper,0,0,1200,630)
$cardGraphics.FillRectangle($cardWash,40,40,1120,550)
$cardBrandFont = [System.Drawing.Font]::new($cardFonts.Families[0],22,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
$cardTitleFont = [System.Drawing.Font]::new($cardFonts.Families[0],68,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
$cardBodyFont = [System.Drawing.Font]::new($cardFonts.Families[0],25,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
$cardNoteFont = [System.Drawing.Font]::new($cardFonts.Families[0],22,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
$cardGraphics.DrawString('АНАСТАСИЯ ДОРОНИНА',$cardBrandFont,$cardMuted,78,76)
$cardGraphics.DrawString("Подбор няни`nдля вашей семьи",$cardTitleFont,$cardInk,[System.Drawing.RectangleF]::new(72,150,810,200))
$cardGraphics.DrawString("Поиск, личные интервью`nи сопровождение семьи",$cardBodyFont,$cardInk,[System.Drawing.RectangleF]::new(78,380,780,90))
$cardGraphics.FillRectangle($cardPaper,78,510,550,48)
$cardGraphics.DrawString('Гарантия замены — 6 месяцев',$cardNoteFont,$cardInk,94,519)
$cardRoute = [System.Drawing.Drawing2D.GraphicsPath]::new()
$cardRoute.AddBezier(950,165,1120,190,880,295,1050,350)
$cardRoute.AddBezier(1050,350,1175,390,1010,440,1045,510)
$cardGraphics.DrawPath($cardLine,$cardRoute)
foreach($cardPoint in @(@(950,165),@(1001,250),@(1050,350),@(1061,443),@(1045,510))){$cardGraphics.FillEllipse($cardInk,($cardPoint[0]-10),($cardPoint[1]-10),20,20)}
$cardImage.Save([System.IO.Path]::GetFullPath($OutputPath),[System.Drawing.Imaging.ImageFormat]::Png)
foreach($cardResource in @($cardRoute,$cardLine,$cardBrandFont,$cardTitleFont,$cardBodyFont,$cardNoteFont,$cardPaper,$cardWash,$cardInk,$cardMuted,$cardGraphics,$cardImage,$cardFonts)){$cardResource.Dispose()}
Write-Output 'Created social-card.png (1200 x 630).'
