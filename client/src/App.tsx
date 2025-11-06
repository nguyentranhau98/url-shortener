import { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, _setShortUrl] = useState('');

  return (
    <div className="App">
      <header className="App-header">
        <h1>URL Shortener</h1>
        <p>Shorten your URLs with ease</p>
      </header>

      <main className="App-main">
        <div className="url-form">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your long URL here..."
            className="url-input"
          />
          <button className="shorten-btn">
            Shorten URL
          </button>
        </div>

        {shortUrl && (
          <div className="result">
            <p>Your shortened URL:</p>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Built with React + Vite</p>
      </footer>
    </div>
  );
}

export default App;
