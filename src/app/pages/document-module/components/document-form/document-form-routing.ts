import { Routes, RouterModule } from '@angular/router';
import { DocumentFormComponent } from './document-form.component';

const routes: Routes = [
  { path: '', component: DocumentFormComponent },
  { path: ':id', component: DocumentFormComponent },
  { path: ':id/:userid', component: DocumentFormComponent },
];
export const routing = RouterModule.forChild(routes);