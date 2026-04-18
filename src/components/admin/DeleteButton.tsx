'use client';

interface Props {
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function DeleteButton({ message = 'Delete?', className, children }: Props) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}
    >
      {children ?? 'Delete'}
    </button>
  );
}
