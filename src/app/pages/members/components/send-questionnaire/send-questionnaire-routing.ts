import { Routes, RouterModule } from '@angular/router';
import { SendQuestionnaireComponent } from './send-questionnaire.component';

const routes: Routes = [
  { path: '', component: SendQuestionnaireComponent },
  { path: ':memberid', component: SendQuestionnaireComponent },
];
export const routing = RouterModule.forChild(routes);