import { Routes, RouterModule } from '@angular/router';
import { SupportTicketComponent } from './support-ticket.component';


const routes: Routes = [
  { path: ':id', component: SupportTicketComponent },
];

export const routing = RouterModule.forChild(routes);
