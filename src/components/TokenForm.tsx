interface TokenFormProps {
  onSubmit: (token: string) => void;
}

export function TokenForm({ onSubmit }: TokenFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const token = form.token.value;
    onSubmit(token);
  };

  return (
    <div className="app">
      <header>
        <div className="header-left">
          <svg
            className="sailboat-icon"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z" />
          </svg>
          <h1>Twirrewyn</h1>
        </div>
      </header>
      <main>
        <div className="token-form">
          <h2>GitHub Token Required</h2>
          <p>
            Please enter your GitHub Personal Access Token to sync your
            checklist across devices.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              name="token"
              placeholder="Enter your GitHub token"
              required
              autoComplete="off"
            />
            <button type="submit">Save Token</button>
          </form>
          <p className="token-help">
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
            >
              Create a new token here
            </a>
            <br />
            Make sure to give it the 'gist' scope.
          </p>
        </div>
      </main>
    </div>
  );
}
