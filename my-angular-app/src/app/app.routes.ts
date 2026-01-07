import { Routes } from '@angular/router';
import { HomeComponent } from './home/home'; // 引入首頁
import { ContactComponent } from './contact/contact';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // 空路徑代表首頁
  { path: 'contact', component: ContactComponent },
];