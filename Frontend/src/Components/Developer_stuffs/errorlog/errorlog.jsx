// src/Components/errorlog/ErrorLogPage.jsx
import React, { useMemo, useState } from "react";
import data from "./VEC.logs.json";
import "./errorlog.css";

export default function ErrorLogPage() {
  const pageSize = 25;
  const all = useMemo(() => data?.logs || [], []);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!q) return all;
    const s = q.toLowerCase();
    return all.filter(r =>
      String(r.status).toLowerCase().includes(s) ||
      (r.message || "").toLowerCase().includes(s) ||
      (r.error || "").toLowerCase().includes(s) ||
      (r.endpoint || "").toLowerCase().includes(s) ||
      (r.method || "").toLowerCase().includes(s) ||
      (r.ip || "").toLowerCase().includes(s) ||
      (r.timestamp || "").toLowerCase().includes(s)
    );
  }, [q, all]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  function prev() {
    setPage(p => Math.max(1, p - 1));
  }

  function next() {
    setPage(p => Math.min(totalPages, p + 1));
  }

  function onSearch(e) {
    setQ(e.target.value);
    setPage(1);
  }

  return (
    <div className="errorlog-page">
      <h2 className="name-error">Error Logs</h2>

      <input
        className="search"
        type="text"
        value={q}
        onChange={onSearch}
        placeholder="Search…"
      />

      <div className="table-wrap">
        <table className="log-table">
          <thead>
            <tr>
              <th>No</th>
              <th>status</th>
              <th>message</th>
              <th>error</th>
              <th>endpoint</th>
              <th>method</th>
              <th>ip</th>
              <th>timestamp</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr key={start + i}>
                <td>{start + i + 1}</td>
                <td>{r.status}</td>
                <td>{r.message}</td>
                <td className="pre">{r.error}</td>
                <td>{r.endpoint}</td>
                <td>{r.method}</td>
                <td>{r.ip}</td>
                <td>{r.timestamp}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">No data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button onClick={prev} disabled={currentPage === 1}>Back</button>
        <span>Page {currentPage} / {totalPages}</span>
        <button onClick={next} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
}
