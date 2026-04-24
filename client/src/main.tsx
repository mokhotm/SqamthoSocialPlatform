// Apply HMR patch to fix WebSocket issues
import "./hmr-patch";

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
