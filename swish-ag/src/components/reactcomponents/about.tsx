import { useState, useEffect, useRef } from "react";
import { dashButtons } from "../data/data";
import AboutInfo from "./reusable";

const SwishAbout = () => {
  const [aboutActive, setAboutActive] = useState(dashButtons[0].id);
  const current = dashButtons.find((btn) => btn.id === aboutActive);
  const sectionRef = useRef<HTMLElement>(null);

  // Only preload when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          dashButtons.flatMap((btn) =>
            btn.contents.forEach((item) => {
              const link = document.createElement("link");
              link.rel = "preload";
              link.as = "image";
              link.href = item.image;
              document.head.appendChild(link);
            })
          );
          observer.disconnect(); // preload once, then stop watching
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="about-container">
        <div className="inner-container-abt">
          <div className="about-dashboard">
            <div className="about-title">
              <h1>Site <span>Overview</span></h1>
            </div>
            <div className="side-navigationBtn">
              {dashButtons.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setAboutActive(id)}
                  className={`sideBtn-About ${aboutActive === id ? "activedBtn-About" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="use-components">
            <AboutInfo key={aboutActive} current={current} />
          </div>
        </div>
      </div>

      <div className="divider--labeled">
        <span className="divider__label">Swish-AG</span>
      </div>

    </section>
  );
};

export default SwishAbout;