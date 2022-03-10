import { Routes, RouterModule } from '@angular/router';
import { CampaignProfileComponent } from './campaign-profile.component';

const routes: Routes = [
  { path: '', component: CampaignProfileComponent },
  { path: ':id', component: CampaignProfileComponent },
  { path: ':id/:formid', component: CampaignProfileComponent },
];
export const routing = RouterModule.forChild(routes);