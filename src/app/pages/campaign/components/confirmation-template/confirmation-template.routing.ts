import { Routes, RouterModule } from '@angular/router';
import { ConfirmationTemplateComponent } from './confirmation-template.component';

const routes: Routes = [
  { path: '', component: ConfirmationTemplateComponent },
  { path: ':id', component: ConfirmationTemplateComponent },
];
export const routing = RouterModule.forChild(routes);