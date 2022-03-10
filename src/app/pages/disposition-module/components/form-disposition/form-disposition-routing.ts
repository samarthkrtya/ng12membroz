import { Routes, RouterModule } from '@angular/router';
import { FormDispositionComponent } from './form-disposition.component';

const routes: Routes = [
  { path: '', component: FormDispositionComponent },
  { path: ':id', component: FormDispositionComponent },
];
export const routing = RouterModule.forChild(routes);