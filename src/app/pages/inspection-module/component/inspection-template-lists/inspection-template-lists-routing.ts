import { Routes, RouterModule } from '@angular/router';
import { InspectionTemplateListsComponent } from './inspection-template-lists.component';

const routes: Routes = [
  { path: '', component: InspectionTemplateListsComponent },
  { path: ':id', component: InspectionTemplateListsComponent },
];
export const routing = RouterModule.forChild(routes);