import { Routes, RouterModule } from '@angular/router';
import { ActivityTemplateComponent } from './activity-template.component';


const routes: Routes = [
  { path: '', component: ActivityTemplateComponent },
  { path: ':id', component: ActivityTemplateComponent },
];

export const routing = RouterModule.forChild(routes);
