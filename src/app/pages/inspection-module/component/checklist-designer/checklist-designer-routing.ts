import { Routes, RouterModule } from '@angular/router';
import { ChecklistDesignerComponent } from './checklist-designer.component';

const routes: Routes = [
  { path: '', component: ChecklistDesignerComponent },
  { path: ':formname', component: ChecklistDesignerComponent },
];
export const routing = RouterModule.forChild(routes);