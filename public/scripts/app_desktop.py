"""
SmartWaste AI - Standalone Native Desktop Application
Course: Btech CSE 2024
Subject: Python (BTCS 510-18)
Teacher: Mrs. Ishatpreet Kaur
Project Members:
  - Aayush Gupta (Roll No: 2445556)
  - Sehajpal Singh (Roll No: 2445712)

Built with Python, PyWebView, and SQLite.
Can be compiled into a standalone Windows .exe using PyInstaller.
"""

import os
import sys
import threading
import sqlite3
import webview

DATABASE_FILE = "smartwaste_local.db"

def init_database():
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS classifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        category TEXT NOT NULL,
        confidence REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        model_version TEXT NOT NULL,
        notes TEXT
    )
    """)
    conn.commit()
    conn.close()

class DesktopApi:
    """Python API bridge exposed to the desktop UI window"""
    def save_classification(self, filename, category, confidence, notes=""):
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        cursor.execute("""
        INSERT INTO classifications (filename, category, confidence, model_version, notes)
        VALUES (?, ?, ?, ?, ?)
        """, (filename, category, confidence, "MobileNetV2-Transfer-v1.4", notes))
        conn.commit()
        record_id = cursor.lastrowid
        conn.close()
        return {"success": True, "id": record_id}

    def get_history(self):
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        cursor.execute("SELECT id, filename, category, confidence, created_at, model_version, notes FROM classifications ORDER BY id DESC")
        rows = cursor.fetchall()
        conn.close()
        return [
            {
                "id": r[0],
                "filename": r[1],
                "category": r[2],
                "confidence": r[3],
                "created_at": r[4],
                "model_version": r[5],
                "notes": r[6] or ""
            }
            for r in rows
        ]

def main():
    init_database()
    api = DesktopApi()
    
    # Target URL: Local dev server or remote deployed production URL
    app_url = os.environ.get("APP_URL", "http://localhost:3000")
    
    window = webview.create_window(
        title="SmartWaste AI - Intelligent Waste Classifier",
        url=app_url,
        width=1280,
        height=850,
        resizable=True,
        min_size=(960, 640),
        js_api=api
    )
    
    webview.start(debug=False)

if __name__ == "__main__":
    main()
