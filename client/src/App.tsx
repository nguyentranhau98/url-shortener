import { useState, FormEvent } from 'react';
import { useUrlShortener } from '@hooks/useUrlShortener';
import { validateUrl, normalizeUrl } from '@utils/validation';
import './App.css';

function App() {
    const [url, setUrl] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const { shortenUrl, loading, error, result, clearResult } = useUrlShortener();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const validationErr = validateUrl(url);
        if (validationErr) {
            setValidationError(validationErr);
            return;
        }

        setValidationError(null);
        const normalized = normalizeUrl(url);
        await shortenUrl(normalized);
    };

    const handleInputChange = (value: string) => {
        setUrl(value);
        if (validationError) {
            setValidationError(null);
        }
    };

    const handleReset = () => {
        setUrl('');
        clearResult();
        setValidationError(null);
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>URL Shortener</h1>
                <p>Shorten your URLs with ease</p>
            </header>

            <main className="App-main">
                <form onSubmit={handleSubmit} className="url-form">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="Enter your long URL here..."
                        className={`url-input ${validationError || error ? 'error' : ''}`}
                        disabled={loading}
                    />
                    {validationError && <span className="error-text">{validationError}</span>}
                    {error && <span className="error-text">{error}</span>}

                    <button
                        type="submit"
                        className="shorten-btn"
                        disabled={loading || !url.trim()}
                    >
                        {loading ? 'Shortening...' : 'Shorten URL'}
                    </button>
                </form>

                {result && (
                    <div className="result">
                        <h3>✨ Your shortened URL is ready!</h3>
                        <div className="result-content">
                            <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">
                                {result.shortUrl}
                            </a>
                        </div>
                        <div className="result-details">
                            <p><strong>Original:</strong> {result.originalUrl}</p>
                            <p><strong>Code:</strong> {result.urlSlug}</p>
                        </div>
                        <button onClick={handleReset} className="reset-btn">
                            Shorten Another URL
                        </button>
                    </div>
                )}
            </main>

            <footer className="App-footer">
                <p>Built with React + Vite + TypeScript</p>
            </footer>
        </div>
    );
}

export default App;
