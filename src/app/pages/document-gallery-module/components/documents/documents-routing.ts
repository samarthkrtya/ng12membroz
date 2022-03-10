import { Routes, RouterModule } from '@angular/router';
import { DocumentsComponent } from './documents.component';

const routes: Routes = [
  { path: '', component: DocumentsComponent },
  { path: ':id', component: DocumentsComponent },
];
export const routing = RouterModule.forChild(routes);