
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing } from './live-chat-components.routing';
import { LiveChatComponentsComponent } from './live-chat-components.component';

@NgModule({
    imports: [
        CommonModule,
        routing,
        FormsModule,
    ],
    declarations: [
        LiveChatComponentsComponent,
    ],
    providers: [
    ]
})

export class LiveChatComponentsModule {}
