import { Routes, RouterModule } from '@angular/router';
import { FormDetailComponent } from './form-detail.component';

const routes: Routes = [
  { path: '', component: FormDetailComponent },
  { path: ':id', component: FormDetailComponent },
];
export const routing = RouterModule.forChild(routes);