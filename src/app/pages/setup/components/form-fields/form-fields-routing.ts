import { Routes, RouterModule } from '@angular/router';
import { FormFieldsComponent } from './form-fields.component';

const routes: Routes = [
  { path: '', component: FormFieldsComponent },
  { path: ':formname', component: FormFieldsComponent },
];
export const routing = RouterModule.forChild(routes);