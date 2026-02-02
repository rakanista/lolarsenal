import { useEffect, useRef, useState } from "react";

import { Pencil } from "lucide-react";

type EditableTitleProps = {
  value: string;
  onCommit: (nextValue: string) => void;

  className?: string;
  inputClassName?: string;

  emptyFallback?: string;
  tooltip?: string;
};

export const EditableTitle = ({
  value,
  onCommit,
  className,
  inputClassName,
  emptyFallback = "Untitled",
  tooltip = "Double click to edit",
}: EditableTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const skipCommitOnBlurRef = useRef(false);

  useEffect(() => {
    if (!isEditing) return;

    const el = inputRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.focus();
      el.select();
    });
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) return;
    setDraft(value);
  }, [value, isEditing]);

  const commit = () => {
    if (skipCommitOnBlurRef.current) {
      skipCommitOnBlurRef.current = false;
      return;
    }

    const next = draft.trim();
    setIsEditing(false);

    if (next.length === 0) {
      setDraft(value);
      return;
    }

    if (next !== value) onCommit(next);
  };

  const cancel = () => {
    setIsEditing(false);
    setDraft(value);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }

          if (e.key === "Escape") {
            e.preventDefault();
            // Comentário (PT): evita o blur salvar logo após o Escape
            skipCommitOnBlurRef.current = true;
            cancel();
          }
        }}
        className={inputClassName}
      />
    );
  }

  const displayValue = value.trim().length ? value : emptyFallback;

  return (
    <div
      className={className}
      title={tooltip}
      onDoubleClick={() => {
        setDraft(value);
        setIsEditing(true);
      }}
    >
      <span>{displayValue}</span>
      <Pencil className="w-4 h-4 opacity-0 group-hover:opacity-80 transition-opacity" />
    </div>
  );
};
