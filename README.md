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
