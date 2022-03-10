import { Routes, RouterModule } from '@angular/router';
import { TemplateComponent } from './template.component';

const routes: Routes = [
  { path: '', component: TemplateComponent },
  { path: ':id', component: TemplateComponent },
  { path: ':formid/:id', component: TemplateComponent },
];
export const routing = RouterModule.forChild(routes);