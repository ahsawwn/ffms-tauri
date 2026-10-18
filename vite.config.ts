import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";
// @ts-expect-error type error without @types/node package
import process from "node:process";
const host = process.env.TAURI_DEV_HOST;

const kitchenFile = path.resolve(process.cwd(), "kitchen-orders.json");
function readOrders() {
  try { return JSON.parse(fs.readFileSync(kitchenFile, "utf-8")); } catch { return []; }
}
function writeOrders(data: any) { fs.writeFileSync(kitchenFile, JSON.stringify(data)); }

export default defineConfig(() => ({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "kitchen-api",
      configureServer(server) {
        server.middlewares.use("/api/kitchen/orders", (req, res) => {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
          if (req.method === "OPTIONS") { res.statusCode = 204; res.end(); return; }
          if (req.method === "GET") {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(readOrders()));
            return;
          }
          if (req.method === "POST") {
            let body = "";
            req.on("data", (chunk) => { body += chunk; });
            req.on("end", () => {
              try {
                const incoming = JSON.parse(body);
                const current = readOrders();
                if (Array.isArray(incoming)) {
                  writeOrders(incoming);
                } else if (incoming && incoming.id && incoming.kitchenStatus) {
                  const idx = current.findIndex((o: any) => o.id === incoming.id);
                  if (idx >= 0) current[idx] = { ...current[idx], ...incoming };
                  else current.push(incoming);
                  writeOrders(current);
                } else if (incoming && incoming.order) {
                  const exists = current.some((o: any) => o.id === incoming.order.id);
                  if (!exists) current.push(incoming.order);
                  writeOrders(current);
                }
                res.statusCode = 200;
                res.end("ok");
              } catch (e) {
                res.statusCode = 400;
                res.end("bad");
              }
            });
            return;
          }
          res.statusCode = 405;
          res.end();
        });
      },
    },
  ],

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    hmr: {
      protocol: "ws",
      host: "0.0.0.0",
      port: 1421,
    },
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
