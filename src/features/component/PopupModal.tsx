import React from "react";
import "../../css/style_popup.css";

interface PopupModalProps {
  title?: string;
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const PopupModal: React.FC<PopupModalProps> = ({
  title,
  show,
  onClose,
  children,
}) => {
  if (!show) return null;

  return (
    <div className="popup__overlay" data-testid="popup-overlay">
      <div className="popup__content">
        <button className="popup__close" onClick={onClose}>
          &times;
        </button>
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );
};

export default PopupModal;
