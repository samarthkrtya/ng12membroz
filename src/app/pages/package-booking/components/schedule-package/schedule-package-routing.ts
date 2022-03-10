import { Routes, RouterModule } from '@angular/router';
import { SchedulePackageComponent } from './schedule-package.component';

const routes: Routes = [
  { path: ':id', component: SchedulePackageComponent }
];

export const routing = RouterModule.forChild(routes);