import { Routes, RouterModule } from '@angular/router';
import { DocumentTemplateListsComponent } from './document-template-lists.component';

const routes: Routes = [
  { path: '', component: DocumentTemplateListsComponent },
  { path: ':id', component: DocumentTemplateListsComponent },
];
export const routing = RouterModule.forChild(routes);