import { Routes, RouterModule } from '@angular/router';
import { TemplateFormComponent } from './template-form.component';

const routes: Routes = [
  { path: '', component: TemplateFormComponent },
  { path: ':id', component: TemplateFormComponent },
];
export const routing = RouterModule.forChild(routes);