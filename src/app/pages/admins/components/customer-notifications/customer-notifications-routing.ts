import { Routes, RouterModule } from '@angular/router';
import { CustomerNotificationsComponent } from './customer-notifications.component';

export const routes: Routes = [
  { path: '', component: CustomerNotificationsComponent },
];

export const routing = RouterModule.forChild(routes);
