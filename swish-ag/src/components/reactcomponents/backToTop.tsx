import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons";

interface BackToTopProps {
  isPanelOpen?: boolean;
}

const BackToTop = ({ isPanelOpen = false }: BackToTopProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={handleClick}
      className={`back-to-top ${visible && !isPanelOpen ? "show" : ""}`}
      aria-label="Back to top"
    >
      <FontAwesomeIcon icon={faChevronUp} />
    </button>
  );
};

export default BackToTop;