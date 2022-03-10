import { Routes } from '@angular/router';

import { AdminSettingsComponent } from './admin-settings.component';

export const AdminSettingsRoutes: Routes = [
  { path: '', component: AdminSettingsComponent },
  { path: ':id', component: AdminSettingsComponent }
];
