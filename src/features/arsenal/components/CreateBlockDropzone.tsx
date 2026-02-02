import { useState, type DragEvent as ReactDragEvent } from "react";

import { useDroppable } from "@dnd-kit/core";

import { CREATE_BLOCK_DROPPABLE_ID } from "../utils/dndIds";

type CreateBlockDropzoneProps = {
  onDropItem: (itemId: number) => void;
};

export const CreateBlockDropzone = ({
  onDropItem,
}: CreateBlockDropzoneProps) => {
  const [isActive, setIsActive] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: CREATE_BLOCK_DROPPABLE_ID,
  });

  return (
    <div
      ref={setNodeRef}
      className={`mt-6 rounded border-2 border-dashed p-4 text-center font-lol ${
        isActive || isOver
          ? "border-lol-cyan bg-lol-bg-medium text-lol-white"
          : "border-lol-gold-dark text-lol-text"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDragEnter={() => setIsActive(true)}
      onDragLeave={() => setIsActive(false)}
      onDrop={(e: ReactDragEvent<HTMLDivElement>) => {
        // Comentário (PT): isso aqui continua sendo o caminho do HTML5 drag (shop → dropzone)
        e.preventDefault();
        setIsActive(false);

        const rawItemId = e.dataTransfer.getData("text/plain");
        const itemId = Number(rawItemId);
        if (!Number.isFinite(itemId)) return;

        onDropItem(itemId);
      }}
    >
      Drop here to create a new block
    </div>
  );
};
