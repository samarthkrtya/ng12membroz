import { Routes, RouterModule } from '@angular/router';
import { CampaignFormComponent } from './campaign-form.component';

const routes: Routes = [
  { path: '', component: CampaignFormComponent },
  { path: ':id', component: CampaignFormComponent },
  { path: ':formid/:id', component: CampaignFormComponent },
];
export const routing = RouterModule.forChild(routes);