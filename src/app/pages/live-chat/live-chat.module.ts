
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../app-material/app-material.module';

import { LiveChatRoutes } from './live-chat.routing';
import { LiveChatComponentsComponent } from './components/live-chat-components/live-chat-components.component';
import { LiveChatComponent } from './live-chat.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(LiveChatRoutes),
        FormsModule,
        AppMaterialModule
    ],
    declarations: [
        LiveChatComponent
    ],
    providers: [
    ]
})

export class LiveChatModule {}
