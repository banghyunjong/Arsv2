import type { ReactNode } from 'react';
import { Overlay } from './overlay';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  width?: string;
}

export function Modal({ title, children, onClose, footer, width }: ModalProps) {
  return (
    <Overlay onClose={onClose}>
      <div className="modal-panel" style={width ? { maxWidth: width } : undefined}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </Overlay>
  );
}

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'warning';
}

export function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'default',
}: ConfirmModalProps) {
  return (
    <Overlay onClose={onCancel}>
      <div className="modal-panel modal-panel-sm">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
        </div>
        <div className="modal-body">
          <p className={variant === 'warning' ? 'modal-text-warning' : 'modal-text'}>
            {message}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button
            className={variant === 'warning' ? 'btn-modal-warning' : 'btn-modal-confirm'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
