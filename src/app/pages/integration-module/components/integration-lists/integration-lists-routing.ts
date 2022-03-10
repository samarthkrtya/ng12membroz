import { Routes, RouterModule } from '@angular/router';
import { IntegrationListsComponent } from './integration-lists.component';

const routes: Routes = [
  { path: '', component: IntegrationListsComponent },
  { path: ':type', component: IntegrationListsComponent },
];
export const routing = RouterModule.forChild(routes);