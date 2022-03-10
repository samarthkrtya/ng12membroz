import { Routes, RouterModule } from '@angular/router';
import { DocumentDesignerComponent } from './document-designer.component';

const routes: Routes = [
  { path: '', component: DocumentDesignerComponent },
  { path: ':id', component: DocumentDesignerComponent },
];
export const routing = RouterModule.forChild(routes);