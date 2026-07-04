#!/usr/bin/env python3
"""Servidor estático mínimo (no usa os.getcwd, compatible con el sandbox de preview)."""
import http.server, socketserver

DIRECTORY = "/Users/mathiasolivera/Documents/Claude/Maua automoviles"
PORT = 8765

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()
    def log_message(self, *a):
        pass

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    httpd.serve_forever()
