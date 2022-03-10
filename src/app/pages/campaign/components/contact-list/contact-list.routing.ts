import { Routes, RouterModule } from '@angular/router';
import { ContactListComponent } from './contact-list.component';

const routes: Routes = [
  { path: '', component: ContactListComponent },
  { path: ':id', component: ContactListComponent },
  { path: ':formid/:id', component: ContactListComponent },
];
export const routing = RouterModule.forChild(routes);