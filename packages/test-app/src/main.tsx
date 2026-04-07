import React from 'react'
import ReactDOM from 'react-dom/client'
import { Button } from '@nivoda/components'
import '@nivoda/components/styles.css'
import './styles.css'

function App() {
  return (
    <div className="container">
      <h1>Button Component Test</h1>

      <section>
        <h2>Contained (Default)</h2>
        <div className="button-group">
          <Button>Default</Button>
          <Button variant="contained" intent="primary">Primary</Button>
          <Button variant="contained" intent="success">Success</Button>
          <Button variant="contained" intent="error">Error</Button>
          <Button variant="contained" disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <h2>Secondary</h2>
        <div className="button-group">
          <Button variant="secondary">Secondary</Button>
          <Button variant="secondary" intent="success">Success</Button>
          <Button variant="secondary" intent="error">Error</Button>
          <Button variant="secondary" disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <h2>Outlined</h2>
        <div className="button-group">
          <Button variant="outlined">Outlined</Button>
          <Button variant="outlined" intent="success">Success</Button>
          <Button variant="outlined" intent="error">Error</Button>
          <Button variant="outlined" disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <h2>Text</h2>
        <div className="button-group">
          <Button variant="text">Text</Button>
          <Button variant="text" intent="success">Success</Button>
          <Button variant="text" intent="error">Error</Button>
          <Button variant="text" disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <h2>Link</h2>
        <div className="button-group">
          <Button variant="link">Link</Button>
          <Button variant="link" intent="success">Success</Button>
          <Button variant="link" intent="error">Error</Button>
        </div>
      </section>

      <section>
        <h2>Sizes</h2>
        <div className="button-group">
          <Button size="sm">Small</Button>
          <Button size="md">Medium (Default)</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <section>
        <h2>Polymorphic (asChild)</h2>
        <div className="button-group">
          <Button asChild>
            <a href="#">Link as Button</a>
          </Button>
          <Button asChild variant="outlined">
            <a href="#">Outlined Link</a>
          </Button>
        </div>
      </section>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
