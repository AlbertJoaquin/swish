import type { JSX } from "react/jsx-dev-runtime";
import logo from "/src/assets/swishlogo.png";
import { useEffect, useState } from "react";

const SwishHeader = (): JSX.Element => {
    const [scrolled, setScrolled] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
        setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [drawerOpen]);

    const navItems = [
    { label: "Spotlight", id: "spotlight" },    
    { label: "Events", id: "events" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" },
    ];

  return (
    <>
      <div className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar">
          <div className="navbar-left">
            <img src={logo.src} alt="Swish-AG Logo" className="logo-img" />
            <div className="brand-text">
              <h2 className="brand-title">Swish-AG</h2>
              <p className="brand-subtitle">Stay Ahead of the Game.</p>
            </div>
          </div>

        <ul className="nav-menu">
            {navItems.map((item) => (
            <li key={item.id} className="nav-item">
                <a href={`#${item.id}`}>{item.label}</a>
            </li>
            ))}
        </ul>

          <button
            className="hamburger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      <div
        className={`drawer-backdrop ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      <div className={`drawer ${drawerOpen ? "open" : ""}`}>
        <button
          className="drawer-close"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        <ul className="drawer-nav">
        {navItems.map((item) => (
            <li key={item.id} className="drawer-nav-item" 
            onClick={() => setDrawerOpen(false)}>
            <a href={`#${item.id}`}>{item.label}</a>
            </li>
        ))}
        </ul>
      </div>
    </>
  );
};

export default SwishHeader;