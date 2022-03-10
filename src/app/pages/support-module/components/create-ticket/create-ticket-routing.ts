import { Routes, RouterModule } from '@angular/router';
import { CreateTicketComponent } from './create-ticket.component';


const routes: Routes = [
  { path: '', component: CreateTicketComponent },
  { path: ':id', component: CreateTicketComponent }
];

export const routing = RouterModule.forChild(routes);
