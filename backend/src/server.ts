console.log("🔥 server.ts loaded");

import app from "./app";

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});