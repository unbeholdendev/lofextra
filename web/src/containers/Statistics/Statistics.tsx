import { useAccountContext } from "@/hooks/contexts";
import { useQuery } from "@/hooks/useQuery";
import { getTimestampAfterSubtractingDays } from "@/utils/dates";
import { useMemo, useState } from "react";
import { z } from "zod";
import styles from "./styles.module.css";

const DAYS_AGO_30_TS = getTimestampAfterSubtractingDays(30);
const DAYS_AGO_90_TS = getTimestampAfterSubtractingDays(90);
const DAYS_AGO_182_TS = getTimestampAfterSubtractingDays(182);
const DAYS_AGO_365_TS = getTimestampAfterSubtractingDays(365);

export const Statistics = () => {
  const { pubKeyHex } = useAccountContext();
  const [statsInterval, setStatsInterval] = useState(DAYS_AGO_30_TS);

  const { data } = useQuery(
    `select sum(amount) as total, coalesce(c.title, '<no category>') AS categoryTitle, coalesce(c.id, '-1') AS categoryId from transactions t left join categories c on c.id = t.categoryId and c.deletedAt is null where pubKeyHex = '${pubKeyHex}' and t.deletedAt is null and t.createdAt > ${statsInterval} group by categoryId order by total desc`,
    z.array(
      z.object({
        total: z.number(),
        categoryTitle: z.string(),
        categoryId: z.string(),
      })
    ),
    { refetchOnRemoteUpdate: true }
  );

  const totalInPeriod = useMemo(
    () => data?.reduce((acc, curr) => acc + curr.total, 0),
    [data]
  );

  return (
    <>
      <div className={styles.buttons}>
        <button
          className={statsInterval === DAYS_AGO_30_TS ? "" : "outline"}
          onClick={() => setStatsInterval(DAYS_AGO_30_TS)}
        >
          spent in last 30 days
        </button>
        <button
          className={statsInterval === DAYS_AGO_90_TS ? "" : "outline"}
          onClick={() => setStatsInterval(DAYS_AGO_90_TS)}
        >
          spent in last 90 days
        </button>
        <button
          className={statsInterval === DAYS_AGO_182_TS ? "" : "outline"}
          onClick={() => setStatsInterval(DAYS_AGO_182_TS)}
        >
          spent in last half year
        </button>
        <button
          className={statsInterval === DAYS_AGO_365_TS ? "" : "outline"}
          onClick={() => setStatsInterval(DAYS_AGO_365_TS)}
        >
          spent in last year
        </button>
      </div>

      <div className={styles.scroll}>
        <p className={styles.large}>
          Total in period: <strong>{totalInPeriod}</strong>
        </p>

        {data?.map(({ total, categoryTitle, categoryId }) => (
          <p key={categoryId}>
            {categoryTitle}: <strong>{total}</strong>
          </p>
        ))}
      </div>
    </>
  );
};
