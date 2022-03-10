import { Routes, RouterModule } from '@angular/router';
import { PayrollSettingsComponent } from './payroll-settings.component';

const routes: Routes = [
  { path: '', component: PayrollSettingsComponent},
  { path: ':id', component: PayrollSettingsComponent },
  
];
export const routing = RouterModule.forChild(routes);