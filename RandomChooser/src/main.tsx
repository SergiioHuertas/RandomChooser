import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Chart from './Chart'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Chart />
  </StrictMode>,
)
