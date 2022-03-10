import { Routes, RouterModule } from '@angular/router';
import { BillitemTemplateComponent } from './billitem-template.component';


const routes: Routes = [
  { path: '', component: BillitemTemplateComponent },
  { path: ':id', component: BillitemTemplateComponent },
  { path: 'edit/:id', component: BillitemTemplateComponent },


];

export const routing = RouterModule.forChild(routes);
