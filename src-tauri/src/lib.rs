use serde::Serialize;
use std::fs;
use std::process::Command;

#[derive(Serialize)]
struct PrintResult {
    ok: bool,
    message: String,
}

#[tauri::command]
fn list_printers() -> Vec<String> {
    let mut out = Vec::new();
    if let Ok(o) = Command::new("lpstat").arg("-p").output() {
        let text = String::from_utf8_lossy(&o.stdout);
        for line in text.lines() {
            // "printer NAME is idle."
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 && parts[0] == "printer" {
                out.push(parts[1].to_string());
            }
        }
    }
    out
}

#[tauri::command]
fn print_html(html: String, printer: Option<String>) -> PrintResult {
    // Write HTML to a temp file.
    let dir = std::env::temp_dir();
    let html_path = dir.join("nerve_receipt.html");
    let pdf_path = dir.join("nerve_receipt.pdf");
    if let Err(e) = fs::write(&html_path, html.as_bytes()) {
        return PrintResult { ok: false, message: format!("write html failed: {}", e) };
    }

    // Convert HTML to PDF using headless Chrome (preserves styling).
    let chrome = if std::path::Path::new("/usr/bin/google-chrome").exists() {
        "/usr/bin/google-chrome"
    } else if std::path::Path::new("/usr/bin/chromium").exists() {
        "/usr/bin/chromium"
    } else if std::path::Path::new("/usr/bin/chromium-browser").exists() {
        "/usr/bin/chromium-browser"
    } else {
        "google-chrome"
    };

    let chrome_res = Command::new(chrome)
        .args([
            "--headless",
            "--disable-gpu",
            "--no-sandbox",
            "--no-pdf-header-footer",
            "--window-size=320,320",
            &format!("--print-to-pdf={}", pdf_path.display()),
            html_path.to_str().unwrap_or(""),
        ])
        .output();

    match chrome_res {
        Ok(o) if o.status.success() && pdf_path.exists() => {}
        Ok(o) => {
            let err = String::from_utf8_lossy(&o.stderr);
            return PrintResult { ok: false, message: format!("chrome pdf failed: {}", err) };
        }
        Err(e) => {
            return PrintResult { ok: false, message: format!("chrome spawn failed: {}", e) };
        }
    }

    // Print the PDF via CUPS if a printer is specified.
    if let Some(p) = printer {
        if !p.trim().is_empty() {
            let lp_res = Command::new("lp")
                .args(["-d", p.trim(), pdf_path.to_str().unwrap_or("")])
                .output();
            match lp_res {
                Ok(o) if o.status.success() => {
                    let _ = fs::remove_file(&html_path);
                    let _ = fs::remove_file(&pdf_path);
                    return PrintResult { ok: true, message: format!("printed to {}", p) };
                }
                Ok(o) => {
                    let err = String::from_utf8_lossy(&o.stderr);
                    return PrintResult { ok: false, message: format!("lp failed: {}", err) };
                }
                Err(e) => {
                    return PrintResult { ok: false, message: format!("lp spawn failed: {}", e) };
                }
            }
        }
    }

    // No printer specified: leave PDF for user; report path.
    let _ = fs::remove_file(&html_path);
    PrintResult { ok: true, message: format!("pdf saved: {}", pdf_path.display()) }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![list_printers, print_html])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
