export const createInstanceIdFactory = () => {
  let seq = 0;

  return () => {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    // Comentário (PT): fallback simples caso randomUUID não exista
    seq += 1;
    return `${Date.now()}-${seq}`;
  };
};
