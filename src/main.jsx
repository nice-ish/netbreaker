import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css"; // or "./index.css" depending on your structure
import App from './views/App'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
