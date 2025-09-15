import React, { useEffect, useRef } from "react";

interface ConfirmationPopupProps {
  show: boolean;
  testIdSubmitButton: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  show,
  testIdSubmitButton = "",
  onCancel,
  onConfirm,
}) => {
  if (!show) return null;

  const popupRef = useRef<HTMLDivElement>(null);
  const pos = useRef({
    x: 0, // last translateX
    y: 0, // last translateY
    startX: 0,
    startY: 0,
    dragging: false,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!pos.current.dragging || !popupRef.current) return;

      const dx = e.clientX - pos.current.startX;
      const dy = e.clientY - pos.current.startY;

      const newX = pos.current.x + dx;
      const newY = pos.current.y + dy;

      popupRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!pos.current.dragging) return;

      const dx = e.clientX - pos.current.startX;
      const dy = e.clientY - pos.current.startY;

      pos.current.x += dx;
      pos.current.y += dy;
      pos.current.dragging = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className={"popup__confirmation-show"}>
      <div className="popup__confirmation__overlay">
        <div
          ref={popupRef}
          onMouseDown={(e) => {
            pos.current.dragging = true;
            pos.current.startX = e.clientX;
            pos.current.startY = e.clientY;
          }}
          className="popup__confirmation__content fancy"
        >
          <h3 className="popup__confirmation__title">Konfirmasi</h3>
          <div className="popup__confirmation__text">
            <p>
              <strong>Yakin menyimpan data ini?</strong>
            </p>
          </div>
          <div className="popup__confirmation__buttons">
            <button
              className="btn btn--green popup__confirmation__button popupConfirmation__button--yes"
              onClick={onConfirm}
              data-testid={testIdSubmitButton}
            >
              Yes, submit
            </button>
            <button
              className="btn btn--green popup__confirmation__button popupConfirmation__button--cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
