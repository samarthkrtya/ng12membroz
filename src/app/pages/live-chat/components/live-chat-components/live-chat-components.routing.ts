import { Routes, RouterModule } from '@angular/router';
import { LiveChatComponentsComponent } from './live-chat-components.component';

 
const routes: Routes = [
  { path: '', component: LiveChatComponentsComponent },
  { path: ':id', component: LiveChatComponentsComponent },
];

export const routing = RouterModule.forChild(routes);
