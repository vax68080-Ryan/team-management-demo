import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { UserProfileComponent } from '../user-profile/user-profile';
import { ViewChild, ElementRef } from '@angular/core';

import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  catchError,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, UserProfileComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  title = '我的團隊系統 (全端連線中)';
  apiUrl = 'http://localhost:8080/api/members';

  // ✅ 後端若已支援 q/field/sort/page/pageSize 就設 true
  // 沒支援也沒關係：會自動退回前端搜尋
  useServerSearch = true;

  // 新增成員
  newMemberName = '';

  // 顯示用資料
  teamMembers: any[] = [];
  total = 0;

  // UI 狀態（顯示用）
  loading = false;
  errorMsg = '';
  highlightTerm = '';
  searchField: 'all' | 'name' | 'date' = 'all';
  sortMode: 'newest' | 'oldest' | 'nameAsc' = 'newest';
  page = 1;
  pageSize = 8;

  // reactive 狀態
  private searchTerm$ = new BehaviorSubject<string>('');
  private searchField$ = new BehaviorSubject<'all' | 'name' | 'date'>('all');
  private sortMode$ = new BehaviorSubject<'newest' | 'oldest' | 'nameAsc'>('newest');
  private page$ = new BehaviorSubject<number>(1);
  private pageSize$ = new BehaviorSubject<number>(8);
  private reload$ = new BehaviorSubject<number>(0);

  // 主資料流：搜尋 / 排序 / 分頁 / reload 任何變動都會更新 teamMembers
  membersStream$ = combineLatest([
    this.searchTerm$.pipe(
      map((v) => (v ?? '').toString()),
      debounceTime(250),
      distinctUntilChanged(),
      tap((raw) => {
        const result = this.normalizeResult(raw);
        this.teamMembers = result.items; // ✅ 永遠是陣列，不會 undefined
        this.total = Number(result?.total) || 0; // ✅ 不會 NaN
        this.loading = false;
      })
    ),
    this.searchField$.pipe(tap((v) => (this.searchField = v))),
    this.sortMode$.pipe(tap((v) => (this.sortMode = v))),
    this.page$.pipe(tap((v) => (this.page = v))),
    this.pageSize$.pipe(tap((v) => (this.pageSize = v))),
    this.reload$,
  ]).pipe(
    tap(() => {
      this.loading = true;
      this.errorMsg = '';
    }),
    switchMap(([term, field, sort, page, pageSize]) => {
      const q = term.trim();

      if (this.useServerSearch) {
        return this.fetchFromServer({ q, field, sort, page, pageSize }).pipe(
          catchError(() => {
            this.useServerSearch = false;
            this.errorMsg = '後端搜尋未支援，已改用前端搜尋（功能不受影響）。';
            return this.fetchAllThenFilter({ q, field, sort, page, pageSize });
          })
        );
      }

      return this.fetchAllThenFilter({ q, field, sort, page, pageSize });
    }),
    tap((result: any) => {
      console.log('membersStream result =', result);
      this.teamMembers = Array.isArray(result?.items) ? result.items : [];
      this.total = Number(result?.total) || 0;
      this.loading = false;
    })
  );

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // 啟動資料流
    this.membersStream$.subscribe();
    this.reload();
  }

  // -------- 搜尋 UI 事件 --------
  onSearchInput(value: string) {
    this.highlightTerm = value; // ✅ 這行沒有就會導致 hasSearch 一直 false
    this.searchTerm$.next(value);
    this.page$.next(1);
  }

  onEnterSearch() {
    this.searchTerm$.next(this.searchTerm$.value); // 立刻觸發一次（主要是給「Enter 應該做事」的感覺）
  }

  onEscClear() {
    this.clearSearch(); // 預設只清搜尋，不重置欄位/排序
  }

  setSearchField(v: 'all' | 'name' | 'date') {
    this.searchField$.next(v);
    this.page$.next(1);
  }

  setSortMode(v: 'newest' | 'oldest' | 'nameAsc') {
    this.sortMode$.next(v);
    this.page$.next(1);
  }

  setPageSize(v: number) {
    this.pageSize$.next(v);
    this.page$.next(1);
  }

  clearSearch(options: { resetField?: boolean; resetSort?: boolean } = {}) {
    const { resetField = false, resetSort = false } = options;

    // ✅ 清空輸入框顯示值
    this.highlightTerm = '';

    // ✅ 清空搜尋條件（驅動資料流）
    this.searchTerm$.next('');
    this.page$.next(1);

    // 你可以選擇清除時是否要重置欄位/排序
    if (resetField) this.searchField$.next('all');
    if (resetSort) this.sortMode$.next('newest');

    // ✅ 保持焦點在搜尋框
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 0);
  }

  get maxPage() {
    const total = Number(this.total) || 0;
    const size = Number(this.pageSize) || 1;
    return Math.max(1, Math.ceil(total / size));
  }

  goPrev() {
    this.page$.next(Math.max(1, this.page$.value - 1));
  }

  goNext() {
    this.page$.next(Math.min(this.maxPage, this.page$.value + 1));
  }

  // -------- CRUD --------
  addMember() {
    const name = this.newMemberName.trim();
    if (!name) return;

    const newMember = { name, date: '2026-01' };

    this.http.post<any>(this.apiUrl, newMember).subscribe({
      next: () => {
        this.newMemberName = '';
        // 如果你希望新增後「一定看得到」新資料，可解除下面這行（會清掉搜尋）
        // this.clearSearch();
        this.reload();
      },
      error: (err) => console.error('新增失敗', err),
    });
  }

  deleteMember(id: number) {
    if (confirm('確定要刪除這位成員嗎？')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => this.reload(),
        error: (err) => console.error('刪除失敗', err),
      });
    }
  }

  editMember(event: any) {
    this.http.put(`${this.apiUrl}/${event.id}`, { name: event.name }).subscribe({
      next: () => this.reload(),
      error: (err) => console.error('更新失敗', err),
    });
  }

  upgradeMember(id: number) {
    this.http.put(`${this.apiUrl}/${id}`, { name: 'Angular 學習大師' }).subscribe({
      next: () => this.reload(),
      error: (err) => console.error('升級失敗', err),
    });
  }

  // ✅ trackBy：只有後端每筆都有穩定唯一 id 才建議用
  trackByMemberId(_: number, member: any) {
    return member?.id;
  }

  private reload() {
    this.reload$.next(this.reload$.value + 1);
  }

  // -------- server-side / client-side --------
  private fetchFromServer(opts: {
    q: string;
    field: string;
    sort: string;
    page: number;
    pageSize: number;
  }) {
    const params = new HttpParams()
      .set('q', opts.q)
      .set('field', opts.field)
      .set('sort', opts.sort)
      .set('page', String(opts.page))
      .set('pageSize', String(opts.pageSize));

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((raw) => {
        // 後端回 {items,total}
        if (raw && Array.isArray(raw.items)) {
          return { items: raw.items, total: Number(raw.total) || raw.items.length };
        }
        // 保險：萬一回陣列
        if (Array.isArray(raw)) return { items: raw, total: raw.length };
        return { items: [], total: 0 };
      })
    );
  }

  private fetchAllThenFilter(opts: {
    q: string;
    field: string;
    sort: string;
    page: number;
    pageSize: number;
  }) {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((all) => {
        const q = (opts.q ?? '').toLowerCase();
        const field = opts.field as 'all' | 'name' | 'date';

        // filter
        let filtered = all.filter((m) => {
          if (!q) return true;
          const name = (m?.name ?? '').toLowerCase();
          const date = (m?.date ?? '').toLowerCase();
          if (field === 'name') return name.includes(q);
          if (field === 'date') return date.includes(q);
          return name.includes(q) || date.includes(q);
        });

        // sort
        const parseMonth = (s: string) => {
          const m = (s ?? '').toString().match(/(\d{4})\D?(\d{1,2})/);
          if (!m) return -1;
          return Number(m[1]) * 100 + Number(m[2]);
        };

        filtered = [...filtered].sort((a, b) => {
          if (opts.sort === 'nameAsc') return (a?.name ?? '').localeCompare(b?.name ?? '');
          const am = parseMonth(a?.date ?? '');
          const bm = parseMonth(b?.date ?? '');
          return opts.sort === 'oldest' ? am - bm : bm - am;
        });

        // paginate
        const total = filtered.length;
        const start = (opts.page - 1) * opts.pageSize;
        const items = filtered.slice(start, start + opts.pageSize);

        return { items, total };
      }),
      catchError(() => of({ items: [], total: 0 }))
    );
  }

  private normalizeResult(result: any): { items: any[]; total: number } {
    // 後端回 {items,total}
    if (result && Array.isArray(result.items)) {
      const total = typeof result.total === 'number' ? result.total : result.items.length;
      return { items: result.items, total };
    }

    // 後端回純陣列
    if (Array.isArray(result)) {
      return { items: result, total: result.length };
    }

    // 其他意外情況
    return { items: [], total: 0 };
  }

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  get hasSearch() {
    return (this.highlightTerm ?? '').trim().length > 0;
  }
}
