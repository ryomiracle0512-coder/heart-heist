import { createRoot } from "react-dom/client";
import { App } from "./app/App";
createRoot(document.getElementById("root")!).render(<App />);
if (import.meta.env.DEV) void import("./game/core/dev");
