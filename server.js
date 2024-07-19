const app = require("./app");
const dotenv = require("dotenv");

dotenv.config(); // Wczytaj zmienne środowiskowe z .env

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
