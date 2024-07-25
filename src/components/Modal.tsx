import { type ReactNode } from "react";

type Props = {
  onClose: () => void;
  header?: ReactNode;
  children: ReactNode;
};

export const Modal = ({ header, onClose, children }: Props) => {
  return (
    <dialog open>
      <article>
        <header>
          <button
            type="button"
            aria-label="Close"
            rel="prev"
            onClick={onClose}
          ></button>
          {header}
        </header>

        {children}
      </article>
    </dialog>
  );
};
