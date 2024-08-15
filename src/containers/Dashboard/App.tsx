import { LofikProvider } from "@lofik/react";
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
  ScrollRestoration,
  useLocation,
} from "@tanstack/react-router";
import { Categories } from "./Categories/Categories";
import { CategoryCreate } from "./Categories/CategoryCreate";
import { CategoryDetail } from "./Categories/CategoryDetail";
import { ConfigProvider } from "./Config/ConfigContext";
import { Dashboard } from "./Dashboard";
import { handleRecurringTransactions } from "./handleRecurringTransactions";
import { runMigrations } from "./migrations";
import { RecurringTransactionCreate } from "./RecurringTransactions/RecurringTransactionCreate";
import { RecurringTransactionDetail } from "./RecurringTransactions/RecurringTransactionDetail";
import { RecurringTransactions } from "./RecurringTransactions/RecurringTransactions";
import { routes } from "./routes";
import { Settings } from "./Settings/Settings";
import { Statistics } from "./Statistics/Statistics";
import styles from "./styles.module.css";
import { TransactionCreate } from "./Transactions/TransactionCreate";
import { TransactionDetail } from "./Transactions/TransactionDetail";

const loader = <div aria-busy="true" />;

const SubMenuLinks = () => {
  const location = useLocation();

  return (
    <>
      <li>
        <Link
          to={routes.RECURRING_TRANSACTIONS}
          className={
            location.pathname === routes.RECURRING_TRANSACTIONS
              ? "contrast"
              : "primary"
          }
        >
          recurring
        </Link>
      </li>

      <li>
        <Link
          to={routes.CATEGORIES}
          className={
            location.pathname === routes.CATEGORIES ? "contrast" : "primary"
          }
        >
          categories
        </Link>
      </li>

      <li>
        <Link
          to={routes.SETTINGS}
          className={
            location.pathname === routes.SETTINGS ? "contrast" : "primary"
          }
        >
          settings
        </Link>
      </li>
    </>
  );
};

const rootRoute = createRootRoute({
  component: () => {
    const location = useLocation();

    return (
      <>
        <header>
          <nav>
            <ul>
              <li>
                <h1>lofextra</h1>
              </li>
            </ul>

            <ul>
              <li>
                <Link
                  to={routes.DASHBOARD}
                  className={
                    location.pathname === routes.DASHBOARD
                      ? "contrast"
                      : "primary"
                  }
                >
                  dashboard
                </Link>
              </li>

              <li>
                <Link
                  to={routes.STATISTICS}
                  className={
                    location.pathname === routes.STATISTICS
                      ? "contrast"
                      : "primary"
                  }
                >
                  statistics
                </Link>
              </li>

              <div className={styles["full-menu"]}>
                <SubMenuLinks />
              </div>

              <li className={styles["sub-menu"]}>
                <details className="dropdown">
                  <summary>🍔</summary>
                  <ul dir="rtl">
                    <SubMenuLinks />
                  </ul>
                </details>
              </li>
            </ul>
          </nav>
        </header>

        <LofikProvider
          loader={loader}
          databaseInit={[
            "CREATE TABLE IF NOT EXISTS categories (id VARCHAR(40) PRIMARY KEY, title TEXT NOT NULL, pubKeyHex TEXT NOT NULL, deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL)",
            "CREATE TABLE IF NOT EXISTS transactions (id VARCHAR(40) PRIMARY KEY, title TEXT NOT NULL, amount REAL NOT NULL, currency TEXT DEFAULT 'USD', pubKeyHex TEXT NOT NULL, categoryId VARCHAR(40), deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL)",
            // migrations
            "CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY, createdAt INTEGER NOT NULL)",
          ]}
          websocketServerUrl={import.meta.env.PUBLIC_WS_URL}
          runMigrations={runMigrations}
          onInitialRemoteUpdatesReceived={handleRecurringTransactions}
        >
          <ConfigProvider loader={loader}>
            <section className={styles.section}>
              <ScrollRestoration />
              <Outlet />
            </section>
          </ConfigProvider>
        </LofikProvider>
      </>
    );
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.DASHBOARD,
  component: Dashboard,
});

const statisticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.STATISTICS,
  component: Statistics,
});

const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.CATEGORIES,
  component: Categories,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.SETTINGS,
  component: Settings,
});

const transactionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.TRANSACTION_DETAIL,
  component: TransactionDetail,
});

const transactionCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.TRANSACTION_CREATE,
  component: TransactionCreate,
});

const categoryDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.CATEGORY_DETAIL,
  component: CategoryDetail,
});

const categoryCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.CATEGORY_CREATE,
  component: CategoryCreate,
});

const recurringTransactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.RECURRING_TRANSACTIONS,
  component: RecurringTransactions,
});

const recurringTransactionCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.RECURRING_TRANSACTIONS_CREATE,
  component: RecurringTransactionCreate,
});

const recurringTransactionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.RECURRING_TRANSACTIONS_DETAIL,
  component: RecurringTransactionDetail,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  statisticsRoute,
  categoriesRoute,
  categoryDetailRoute,
  categoryCreateRoute,
  settingsRoute,
  transactionDetailRoute,
  transactionCreateRoute,
  recurringTransactionsRoute,
  recurringTransactionCreateRoute,
  recurringTransactionDetailRoute,
]);

const hashHistory = createHashHistory();

const router = createRouter({ routeTree, history: hashHistory });

export const App = () => <RouterProvider router={router} />;
