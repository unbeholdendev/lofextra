import { SQLocal } from "sqlocal";
import { DB_NAME } from "../constants";

export const sqlocal = new SQLocal(DB_NAME);
