import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const container= document.getElementById('container')
const rootElement = document.getElementById('root')
const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <App containerWidth={container.offsetWidth} />
  </React.StrictMode>,
)

