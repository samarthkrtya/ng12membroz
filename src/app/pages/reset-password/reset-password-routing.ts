import { Routes, RouterModule } from '@angular/router';
import { ResetPasswordComponent } from './reset-password.component';


const routes: Routes = [
  { path: '', component: ResetPasswordComponent },
  { path: ':type', component: ResetPasswordComponent },
];

export const routing = RouterModule.forChild(routes);
