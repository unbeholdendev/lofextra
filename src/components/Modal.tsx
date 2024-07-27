import { type ReactNode } from "react";

type Props = {
  onClose: () => void;
  showCloseIcon?: boolean;
  header?: ReactNode;
  children: ReactNode;
};

export const Modal = ({ header, onClose, showCloseIcon, children }: Props) => {
  return (
    <dialog open>
      <article>
        <header>
          {showCloseIcon && (
            <button
              type="button"
              aria-label="Close"
              rel="prev"
              onClick={onClose}
            />
          )}

          {header}
        </header>

        {children}
      </article>
    </dialog>
  );
};
