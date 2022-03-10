import { Routes, RouterModule } from '@angular/router';
import { EmailPreviewComponent } from './email-preview.component';


const routes: Routes = [
  { path: '', component: EmailPreviewComponent },
  { path: ':id', component: EmailPreviewComponent },
  { path: ':formid/:id', component: EmailPreviewComponent },
  { path: ':formid/:id/:templateid', component: EmailPreviewComponent },
];

export const routing = RouterModule.forChild(routes);
