import { useAccountContext } from "@/hooks/contexts";
import { useQuery } from "@/hooks/useQuery";
import {
  getEndOfDay,
  getEndOfMonth,
  getStartOfMonth,
  getTimestampAfterSubtractingDays,
} from "@/utils/dates";
import { formatNumber } from "@/utils/formatters";
import { useMemo, useState } from "react";
import { z } from "zod";
import { StatisticsDetailModal } from "./StatisticsDetailModal";
import styles from "./styles.module.css";

const DAYS_AGO_30_TS = getTimestampAfterSubtractingDays(30);
const DAYS_AGO_90_TS = getTimestampAfterSubtractingDays(90);
const DAYS_AGO_365_TS = getTimestampAfterSubtractingDays(365);
const RANGE = -1;
const MONTH = -2;

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const currentMonthFormatted =
  currentMonth > 9 ? currentMonth : `0${currentMonth}`;
const currentDay = currentDate.getDate();
const currentDayFormatted = currentDay > 9 ? currentDay : `0${currentDay}`;
const currentDateFormatted = `${currentYear}-${currentMonthFormatted}-${currentDayFormatted}`;

export const Statistics = () => {
  const { pubKeyHex } = useAccountContext();
  const [statsInterval, setStatsInterval] = useState(DAYS_AGO_30_TS);
  const [monthInterval, setMonthInterval] = useState(
    `${currentYear}-${currentMonthFormatted}`
  );
  const [rangeStart, setRangeStart] = useState(currentDateFormatted);
  const [rangeEnd, setRangeEnd] = useState(currentDateFormatted);

  const [detailCategory, setDetailCategory] = useState<{
    categoryId: string;
    categoryTitle: string;
    categoryTotal: number;
  } | null>(null);

  const intervalCondition = useMemo(() => {
    if (statsInterval === MONTH) {
      const monthDate = new Date(monthInterval);

      return `t.createdAt > ${getStartOfMonth(
        monthDate
      ).getTime()} and t.createdAt < ${getEndOfMonth(monthDate).getTime()}`;
    }

    if (statsInterval === RANGE) {
      return `t.createdAt > ${new Date(
        rangeStart
      ).getTime()} and t.createdAt < ${getEndOfDay(
        new Date(rangeEnd)
      ).getTime()}`;
    }

    return `t.createdAt > ${statsInterval}`;
  }, [statsInterval, monthInterval, rangeStart, rangeEnd]);

  const { data } = useQuery(
    `select sum(amount) as categoryTotal, coalesce(c.title, '<no category>') AS categoryTitle, coalesce(c.id, '-1') AS categoryId from transactions t left join categories c on c.id = t.categoryId and c.deletedAt is null where t.pubKeyHex = '${pubKeyHex}' and t.deletedAt is null and ${intervalCondition} group by categoryId order by categoryTotal desc`,
    z.array(
      z.object({
        categoryTotal: z.number(),
        categoryTitle: z.string(),
        categoryId: z.string(),
      })
    ),
    { refetchOnRemoteUpdate: true }
  );

  const totalInPeriod = useMemo(
    () => data?.reduce((acc, curr) => acc + curr.categoryTotal, 0) ?? 0,
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
          className={statsInterval === DAYS_AGO_365_TS ? "" : "outline"}
          onClick={() => setStatsInterval(DAYS_AGO_365_TS)}
        >
          spent in last year
        </button>

        <button
          className={statsInterval === MONTH ? "" : "outline"}
          onClick={() => setStatsInterval(MONTH)}
        >
          month
        </button>

        <button
          className={statsInterval === RANGE ? "" : "outline"}
          onClick={() => setStatsInterval(RANGE)}
        >
          range
        </button>

        {statsInterval === MONTH && (
          <input
            type="month"
            className={styles.input}
            value={monthInterval}
            onChange={(e) => setMonthInterval(e.target.value)}
          />
        )}

        {statsInterval === RANGE && (
          <input
            type="date"
            className={styles.input}
            value={rangeStart}
            onChange={(e) => setRangeStart(e.target.value)}
          />
        )}

        {statsInterval === RANGE && (
          <input
            type="date"
            className={styles.input}
            value={rangeEnd}
            onChange={(e) => setRangeEnd(e.target.value)}
          />
        )}
      </div>

      <div className={styles.scroll}>
        <p className={styles.large}>
          Total in period: <strong>{formatNumber(totalInPeriod)}</strong>
        </p>

        {data?.map(({ categoryTotal, categoryTitle, categoryId }) => (
          <p
            key={categoryId}
            className={styles["statistics-row"]}
            onClick={() =>
              setDetailCategory({
                categoryId,
                categoryTitle,
                categoryTotal,
              })
            }
          >
            {categoryTitle}: <strong>{formatNumber(categoryTotal)}</strong>{" "}
            <span className={styles.small}>
              (
              {(categoryTotal / totalInPeriod).toLocaleString(undefined, {
                style: "percent",
                minimumFractionDigits: 2,
              })}
              )
            </span>
          </p>
        ))}
      </div>

      {detailCategory && (
        <StatisticsDetailModal
          categoryId={detailCategory.categoryId}
          categoryTitle={detailCategory.categoryTitle}
          categoryTotal={detailCategory.categoryTotal}
          intervalCondition={intervalCondition}
          onClose={() => setDetailCategory(null)}
        />
      )}
    </>
  );
};
