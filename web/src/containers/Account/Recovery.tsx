import { useDatabaseContext } from "@/hooks/contexts";

export const Recovery = () => {
  const { exportDatabase } = useDatabaseContext();

  return (
    <div>
      <h3>Recovery</h3>
      <button onClick={exportDatabase}>export</button>
    </div>
  );
};
