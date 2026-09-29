"use client";

import { base_backend_url } from "../next.config";

const app_prefix = "";

export const app_dir_name = "datanest/drive";

export { doc_title } from "./site";

const one_zip_per_conn = false;

const protocol =
    typeof window !== "undefined"
        ? (window.location.protocol === "https:" ? "https" : "http")
        : "https";

const ws_protocol =
    typeof window !== "undefined"
        ? (window.location.protocol === "https:" ? "wss" : "ws")
        : "wss";

const host =
    typeof window !== "undefined"
        ? window.location.host
        : "";

const base_fetch_url =
    `${protocol}://${host}${app_prefix}${base_backend_url}`;

const base_ws_url =
    `${ws_protocol}://${host}${app_prefix}${base_backend_url}`;

const test_backend__communication_each_time = true;

export {
    base_fetch_url,
    test_backend__communication_each_time,
    base_ws_url,
    base_backend_url,
    one_zip_per_conn
};