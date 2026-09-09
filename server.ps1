$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Server running on http://localhost:8080/"

$htmlPath = "C:\Users\LSH2\.gemini\antigravity\scratch\workplace_escape_kit\index.html"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $response = $context.Response
        if (Test-Path $htmlPath) {
            $content = [System.IO.File]::ReadAllBytes($htmlPath)
            $response.ContentType = "text/html; charset=utf-8"
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    } catch {
        # ignore errors on close
    }
}
