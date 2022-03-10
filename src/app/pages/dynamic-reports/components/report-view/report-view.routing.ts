import { Routes, RouterModule } from '@angular/router';
import { ReportViewComponent } from './report-view.component';

const routes: Routes = [
  { path: ':type/:id', component: ReportViewComponent },
];

export const routing = RouterModule.forChild(routes);