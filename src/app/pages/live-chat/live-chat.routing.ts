import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Routes } from '@angular/router';
import { LiveChatComponent } from './live-chat.component';

export const LiveChatRoutes: Routes = [
    { path: '',component: LiveChatComponent,
    children: [
        { 
           path: 'chat/:id', 
          loadChildren: () => import('./components/live-chat-components/live-chat-components.module').then(m => m.LiveChatComponentsModule), 
        },       
      ],
},
];
