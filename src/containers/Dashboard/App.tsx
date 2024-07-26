import { LofikProvider } from "@lofik/react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { Account } from "./Account/Account";
import { Categories } from "./Categories/Categories";
import { Dashboard } from "./Dashboard";
import { Statistics } from "./Statistics/Statistics";
import styles from "./styles.module.css";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <ul>
            <li>
              <h1>lofextra (beta)</h1>
            </li>
          </ul>

          <ul>
            <li>
              <Link to="/dashboard">dashboard</Link>
            </li>

            <li>
              <Link to="/dashboard/statistics">statistics</Link>
            </li>

            <li>
              <Link to="/dashboard/categories">categories</Link>
            </li>

            <li>
              <Link to="/dashboard/account">account</Link>
            </li>
          </ul>
        </nav>
      </header>

      <LofikProvider
        loader={<div aria-busy="true" />}
        databaseInit={[
          "CREATE TABLE IF NOT EXISTS categories (id VARCHAR(40) PRIMARY KEY, title TEXT NOT NULL, deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL)",
          "CREATE TABLE IF NOT EXISTS transactions (id VARCHAR(40) PRIMARY KEY, title TEXT NOT NULL, amount REAL NOT NULL, currency TEXT DEFAULT 'USD', pubKeyHex TEXT NOT NULL, categoryId VARCHAR(40), deletedAt INTEGER, updatedAt INTEGER NOT NULL, createdAt INTEGER NOT NULL)",
        ]}
        websocketServerUrl={import.meta.env.PUBLIC_WS_URL}
      >
        <section className={styles.section}>
          <Outlet />
        </section>
      </LofikProvider>
    </>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
});

const statisticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/statistics",
  component: Statistics,
});

const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/categories",
  component: Categories,
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/account",
  component: Account,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  statisticsRoute,
  categoriesRoute,
  accountRoute,
]);

const router = createRouter({ routeTree });

export const App = () => <RouterProvider router={router} />;
