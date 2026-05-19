const http = require("http");

http.get("http://localhost:3001/api/auth/me", (res) => {
  console.log("Status Code:", res.statusCode);
  let data = "";
  res.on("data", (chunk) => { data += chunk; });
  res.on("end", () => {
    console.log("Body:", data);
    process.exit(0);
  });
}).on("error", (err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
