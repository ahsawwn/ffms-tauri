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
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 && parts[0] == "printer" {
                out.push(parts[1].to_string());
            }
        }
    }
    out
}

fn run_chrome(html_path: &std::path::Path, pdf_path: &std::path::Path) -> Result<(), String> {
    let chrome = if std::path::Path::new("/usr/bin/google-chrome").exists() {
        "/usr/bin/google-chrome"
    } else if std::path::Path::new("/usr/bin/chromium").exists() {
        "/usr/bin/chromium"
    } else if std::path::Path::new("/usr/bin/chromium-browser").exists() {
        "/usr/bin/chromium-browser"
    } else {
        "google-chrome"
    };
    let o = Command::new(chrome)
        .args([
            "--headless",
            "--disable-gpu",
            "--no-sandbox",
            "--no-pdf-header-footer",
            "--window-size=320,320",
            &format!("--print-to-pdf={}", pdf_path.display()),
            html_path.to_str().unwrap_or(""),
        ])
        .output()
        .map_err(|e| format!("chrome spawn failed: {}", e))?;
    if !o.status.success() || !pdf_path.exists() {
        let err = String::from_utf8_lossy(&o.stderr);
        return Err(format!("chrome pdf failed: {}", err));
    }
    Ok(())
}

fn content_height_mm(pdf_path: &std::path::Path) -> Option<f64> {
    // Use gs bbox to get content height in points, convert to mm.
    let o = Command::new("gs")
        .args(["-sDEVICE=bbox", "-dBATCH", "-dNOPAUSE", pdf_path.to_str().unwrap_or("")])
        .output()
        .ok()?;
    let text = String::from_utf8_lossy(&o.stderr);
    for line in text.lines() {
        if line.starts_with("%%HiResBoundingBox:") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            // HiResBoundingBox: x1 y1 x2 y2
            if parts.len() >= 5 {
                let y1: f64 = parts[2].parse().ok()?;
                let y2: f64 = parts[4].parse().ok()?;
                let h_pt = (y2 - y1).max(1.0);
                // pts -> mm (1pt = 0.352778mm), add 4mm padding
                return Some(h_pt * 0.352778 + 4.0);
            }
        }
    }
    None
}

#[tauri::command]
fn print_html(html: String, printer: Option<String>) -> PrintResult {
    let dir = std::env::temp_dir();
    let html_path = dir.join("nerve_receipt.html");
    let pdf_path = dir.join("nerve_receipt.pdf");
    let pdf_path2 = dir.join("nerve_receipt2.pdf");

    // First pass: tall page to measure content. Inject size into @page (frontend sends margin-only).
    let mut html_tall = html.replace("@page { margin: 0mm; }", "@page { size: 80mm 297mm; margin: 0mm; }");
    if html_tall == html {
        html_tall = html.replace("@page{margin:0mm;}", "@page{size:80mm 297mm;margin:0mm;}");
    }
    if let Err(e) = fs::write(&html_path, html_tall.as_bytes()) {
        return PrintResult { ok: false, message: format!("write html failed: {}", e) };
    }
    if let Err(e) = run_chrome(&html_path, &pdf_path) {
        return PrintResult { ok: false, message: e };
    }

    // Measure content height.
    let h_mm = content_height_mm(&pdf_path).unwrap_or(297.0).min(297.0).max(20.0);

    // Second pass: exact height to avoid trailing blank paper.
    let mut html_exact = html.replace("@page { margin: 0mm; }", &format!("@page {{ size: 80mm {}mm; margin: 0mm; }}", h_mm as i32));
    if html_exact == html {
        html_exact = html.replace("@page{margin:0mm;}", &format!("@page{{size:80mm {}mm;margin:0mm;}}", h_mm as i32));
    }
    if let Err(e) = fs::write(&html_path, html_exact.as_bytes()) {
        return PrintResult { ok: false, message: format!("write html2 failed: {}", e) };
    }
    if run_chrome(&html_path, &pdf_path2).is_err() {
        // fallback to first pdf
        let _ = fs::copy(&pdf_path, &pdf_path2);
    }

    // Print via CUPS if printer specified.
    if let Some(p) = printer {
        if !p.trim().is_empty() {
            let lp_res = Command::new("lp")
                .args(["-d", p.trim(), pdf_path2.to_str().unwrap_or("")])
                .output();
            match lp_res {
                Ok(o) if o.status.success() => {
                    let _ = fs::remove_file(&html_path);
                    let _ = fs::remove_file(&pdf_path);
                    let _ = fs::remove_file(&pdf_path2);
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

    let _ = fs::remove_file(&html_path);
    PrintResult { ok: true, message: format!("pdf saved: {}", pdf_path2.display()) }
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
