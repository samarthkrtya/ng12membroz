import { Routes, RouterModule } from '@angular/router';
import { JoborderInfoRenderComponent } from './joborder-info-render.component';

const routes: Routes = [
  { path: '', component: JoborderInfoRenderComponent },
  { path: ':id', component: JoborderInfoRenderComponent },       // 123
  { path: ':customer/:cid', component: JoborderInfoRenderComponent },
];
export const routing = RouterModule.forChild(routes);