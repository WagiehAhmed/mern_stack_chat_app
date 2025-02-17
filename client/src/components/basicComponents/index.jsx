import React, { forwardRef, useEffect } from "react";
// icons
import { CgClose } from "react-icons/cg";
export function IconButton({ children, className: cn = "", ...props }) {
  return (
    <button className={`icon-button ${cn}`} {...props}>
      {children}
    </button>
  );
}

export function StandardModal({ onClose, header = "", children }) {
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      className="bg-black/50 w-screen h-screen fixed top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center z-50 select-none hover:cursor-pointer"
    >
      <div
        className="w-5/6 sm:w-3/4 md:w-1/3 bg-background rounded-lg max-h-[95%] overflow-y-auto"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex flex-row justify-between items-center p-1 ">
          <h4 className="self-center text-center text-md text-text-primary font-semibold capitalize flex-grow min-h-8">
            {header}
          </h4>
          <IconButton
            onClick={onClose}
            className="bg-transparent hover:text-white "
          >
            <CgClose size={20} />
          </IconButton>
        </div>
        <div className="flex flex-col items-stretch justify-center gap-2 p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
export function ModernModal({ onClose, children }) {
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);
  return (
    <div
      onClick={onClose}
      className="bg-black/50 w-screen h-screen fixed top-0 left-0 right-0 bottom-0 flex flex-col justify-start items-center z-50 select-none hover:cursor-pointer pt-10 "
    >
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-2 end-2 bg-transparent hover:text-white"
      >
        <CgClose size={20} />
      </IconButton>
      <div className="w-5/6 md:w-1/2 sm:w-3/4 lg:w-1/3 bg-transparent max-h-[95%] overflow-y-hidden">
        {children}
      </div>
    </div>
  );
}

export function FormContainer({ children, className: cn = "", ...props }) {
  return (
    <div
      className={`p-5 rounded-lg shadow-2xl w-[95%] xs:w-1/2 sm:w-1/2 lg:w-1/3 bg-background ${cn} max-h-[95%] overflow-y-auto`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Button({ children, className: cn = "", ...props }) {
  return (
    <button {...props} className={`button text-[#FFFFFF] ${cn}`}>
      {children}
    </button>
  );
}
export function Form({ className: cn = "", children, ...props }) {
  return (
    <form {...props} className={`flex flex-col justify-evenly gap-2 ${cn} `}>
      {children}
    </form>
  );
}
export function Label({ className: cn = "", children, ...props }) {
  return (
    <label {...props} className={`label ${cn}`}>
      {children}
    </label>
  );
}

export const Input = forwardRef(({ className: cn, ...props }, ref) => {
  return <input ref={ref} {...props} className={`input ${cn}`} />;
});
