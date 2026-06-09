
  # Untitled

  This is a code bundle for Untitled. The original project is available at https://www.figma.com/design/rAfwBtmzUfBltRN0bUwRjP/Untitled.

  ## Running the code

  ### Frontend
  ```bash
  cd frontend
  pnpm install
  pnpm run dev
  ```

  ### Backend (MySQL + Tuya OpenAPI)
  1. Configura `backend/.env` (MySQL y `TUYA_API_KEY` / `TUYA_API_SECRET`).
  2. Inicializa la base de datos e inicia el servidor:
  ```bash
  cd backend
  npm install
  npm run db:init
  npm start
  ```
  Usuario de prueba: cédula `isaac`, contraseña `isaac`.
  