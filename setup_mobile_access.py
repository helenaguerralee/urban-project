import os
import sys
import socket
import urllib.request
import http.server
import socketserver

sys.stdout.reconfigure(encoding='utf-8')

app_dir = r"C:\Users\LSH2\.gemini\antigravity\scratch\workplace_escape_kit"
os.chdir(app_dir)

# 1. Get Local IP Address
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "192.168.0.46"

local_ip = get_local_ip()
port = 8080
mobile_url = f"http://{local_ip}:{port}/urban_project_manager.html"

print(f"Mobile Access URL: {mobile_url}")

# 2. Download QR Code PNG image for easy scanning
qr_api_url = f"https://quickchart.io/qr?text={urllib.parse.quote(mobile_url)}&size=400&margin=2"
qr_path = os.path.join(app_dir, "mobile_qr.png")

try:
    urllib.request.urlretrieve(qr_api_url, qr_path)
    print(f"QR Code saved: {qr_path}")
except Exception as e:
    print(f"QR download fallback: {e}")

# 3. Start HTTP Server
class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

handler = http.server.SimpleHTTPRequestHandler
server = ThreadedHTTPServer(("0.0.0.0", port), handler)
print(f"Server started on port {port}...")
server.serve_forever()
