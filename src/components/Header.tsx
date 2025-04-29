import { useState } from "react";

interface HeaderProps {
  onReset: () => void;
  onLogout: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

export function Header({
  onReset,
  onLogout,
  isEditMode,
  onToggleEditMode,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
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
      <button
        className="menu-button"
        onClick={toggleMenu}
        aria-label="Open menu"
      >
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      {isMenuOpen && (
        <div className="menu-overlay" onClick={closeMenu}>
          <div className="menu-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-menu"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <span></span>
              <span></span>
            </button>
            <button
              className="menu-item"
              onClick={() => {
                onToggleEditMode();
                closeMenu();
              }}
            >
              {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
            </button>
            <button
              className="menu-item"
              onClick={() => {
                onReset();
                closeMenu();
              }}
            >
              Reset Checklist
            </button>
            <button
              className="menu-item"
              onClick={() => {
                onLogout();
                closeMenu();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
