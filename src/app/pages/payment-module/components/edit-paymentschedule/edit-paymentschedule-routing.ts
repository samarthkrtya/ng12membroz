import { Routes, RouterModule } from '@angular/router';
import { EditPaymentScheduleComponent } from './edit-paymentschedule.component';
const routes: Routes = [
  { path: ':id', component: EditPaymentScheduleComponent },
];
export const routing = RouterModule.forChild(routes);