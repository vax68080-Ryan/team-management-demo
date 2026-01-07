import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app'; // 依據你檔案名稱可能沒有 .component
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http'; // 👈 關鍵：引入通訊工具

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient() // 🚀 關鍵：在這裡「插上插頭」，HttpClient 才能發揮作用
  ]
}).catch((err) => console.error(err));