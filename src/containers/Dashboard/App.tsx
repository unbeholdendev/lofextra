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
import { Account } from "./Account/Account";
import { Categories } from "./Categories/Categories";
import { CategoryCreate } from "./Categories/CategoryCreate";
import { CategoryDetail } from "./Categories/CategoryDetail";
import { Dashboard } from "./Dashboard";
import { runMigrations } from "./migrations";
import { routes } from "./routes";
import { Statistics } from "./Statistics/Statistics";
import styles from "./styles.module.css";
import { TransactionCreate } from "./Transactions/TransactionCreate";
import { TransactionDetail } from "./Transactions/TransactionDetail";

const SubMenuLinks = () => {
  const location = useLocation();

  return (
    <>
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
          to={routes.ACCOUNT}
          className={
            location.pathname === routes.ACCOUNT ? "contrast" : "primary"
          }
        >
          account
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
          loader={<div aria-busy="true" />}
          databaseInit={[
            "CREATE TABLE IF NOT EXISTS categories (id VARCHAR(40) PRIMARY KEY, title TEXT NOT NULL, pubKeyHex TEXT NOT NULL, deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL)",
            "CREATE TABLE IF NOT EXISTS transactions (id VARCHAR(40) PRIMARY KEY, title TEXT NOT NULL, amount REAL NOT NULL, currency TEXT DEFAULT 'USD', pubKeyHex TEXT NOT NULL, categoryId VARCHAR(40), deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL)",
            // migrations
            "CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, createdAt INTEGER NOT NULL)",
          ]}
          runMigrations={runMigrations}
          websocketServerUrl={import.meta.env.PUBLIC_WS_URL}
        >
          <section className={styles.section}>
            <ScrollRestoration />
            <Outlet />
          </section>
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

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.ACCOUNT,
  component: Account,
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

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  statisticsRoute,
  categoriesRoute,
  categoryDetailRoute,
  categoryCreateRoute,
  accountRoute,
  transactionDetailRoute,
  transactionCreateRoute,
]);

const hashHistory = createHashHistory();

const router = createRouter({ routeTree, history: hashHistory });

export const App = () => <RouterProvider router={router} />;
