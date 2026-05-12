"use client";

type DeleteConfirmButtonProps = {
  className?: string;
  confirmMessage?: string;
  label?: string;
};

export function DeleteConfirmButton({
  className,
  confirmMessage = "Are you sure you want to delete this item?",
  label = "Delete",
}: DeleteConfirmButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
