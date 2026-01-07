> 本專案為一個示範型全端專案，重點在於前後端資料流設計、
> REST API 規劃、搜尋/分頁邏輯，以及 Angular 狀態同步處理。

# Team Management Demo (Angular + Spring Boot)

一個全端小型專案：前端使用 **Angular**，後端使用 **Spring Boot REST API**，資料使用 **H2（File Mode）** 持久化。  
重點展示：**CRUD、搜尋、排序、分頁、前後端串接、資料持久化、錯誤處理與狀態同步**。

---

## 🚀 Features（功能）
- ✅ 成員列表（從後端取得）
- ✅ 新增 / 編輯 / 刪除（CRUD）
- ✅ 搜尋（Enter 搜尋 / Esc 清除）
- ✅ 篩選欄位（全部 / 姓名 / 月份）
- ✅ 排序（新到舊 / 舊到新 / 名字 A→Z）
- ✅ 分頁（page / pageSize）
- ✅ 後端支援 server-side 搜尋分頁（`/api/members` query params）
- ✅ 前端具備 fallback（若後端不支援搜尋時仍可前端搜尋）

---

## 🧱 Tech Stack（技術棧）
**Frontend**
- Angular（Standalone Components）
- FormsModule / ngModel
- HttpClient + RxJS（switchMap、catchError、tap）

**Backend**
- Spring Boot
- Spring Data JPA
- H2 Database（File Mode）

---

## 🗂 Project Structure（專案結構）

## 🔄 Data Flow（前後端資料流）

1. Angular 透過 HttpClient 呼叫 `/api/members`
2. 搜尋、排序、分頁條件以 query params 傳遞
3. Spring Boot Controller 依條件組合 JPA 查詢
4. 回傳 `{ items, total }` 結構
5. 前端更新列表與分頁狀態

- 為避免大量資料一次載入，搜尋與分頁優先由後端處理（server-side）。
- 前端保留 fallback 機制，當 API 不支援搜尋時仍可於前端過濾。
