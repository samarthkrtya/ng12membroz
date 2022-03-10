import { Routes, RouterModule } from '@angular/router';
import { SchedulerIntegrationComponent } from './scheduler-integration.component';

const routes: Routes = [
  { path: '', component: SchedulerIntegrationComponent },
];
export const routing = RouterModule.forChild(routes);
