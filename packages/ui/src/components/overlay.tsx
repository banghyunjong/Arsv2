import type { ReactNode } from 'react';

interface OverlayProps {
  children: ReactNode;
  onClose: () => void;
}

export function Overlay({ children, onClose }: OverlayProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-center" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
