import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HighlightPipe } from '../shared/highlight.pipe';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [HighlightPipe],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfileComponent {
  @Input() id: number = 0;
  @Input() userName: string = '';
  @Input() joinDate: string = '';

  // ✅ 高亮用
  @Input() highlightTerm: string = '';
  @Input() highlightField: 'all' | 'name' | 'date' = 'all';

  @Output() delete = new EventEmitter<number>();
  @Output() edit = new EventEmitter<any>();
  @Output() upgrade = new EventEmitter<number>(); // ✅ 不要直接改 @Input，改成發事件

  onDelete() {
    this.delete.emit(this.id);
  }

  onEdit() {
    const newName = prompt('請輸入新的名字：', this.userName);
    if (newName) this.edit.emit({ id: this.id, name: newName });
  }

  onUpgrade() {
    this.upgrade.emit(this.id);
  }
}
