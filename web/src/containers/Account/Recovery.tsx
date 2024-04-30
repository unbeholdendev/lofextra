import { useDatabaseContext } from "@/hooks/contexts";

export const Recovery = () => {
  const { exportDatabase } = useDatabaseContext();

  return (
    <div>
      <h3>recovery</h3>
      <p>download all your data in a single database file</p>
      <button onClick={exportDatabase}>export</button>
    </div>
  );
};
