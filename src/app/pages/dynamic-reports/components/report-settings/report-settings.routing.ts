import { Routes, RouterModule } from '@angular/router';
import { ReportSettingsComponent } from './report-settings.component';

const routes: Routes = [
  { path: '', component: ReportSettingsComponent }, 
  { path: ':id', component: ReportSettingsComponent }, 
  { path: ':id/:formid', component: ReportSettingsComponent }, 
];

export const routing = RouterModule.forChild(routes);