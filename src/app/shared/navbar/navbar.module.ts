import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';

import { GlobalSearchbarModule } from '../../shared/global-searchbar/global-searchbar.module';
import { QuickaddModule } from '../../shared/quickadd/quickadd.module';

import { NgIdleKeepaliveModule } from '@ng-idle/keepalive'; // this includes the core NgIdleModule but includes keepalive providers for easy wireup

import { MomentModule } from 'angular2-moment'; // optional, provides moment-style pipes for date formatting
import { SharedModule } from '../shared.module';

@NgModule({
    imports: [ 
        RouterModule, 
        CommonModule,
        GlobalSearchbarModule,
        QuickaddModule,
        MomentModule,
        NgIdleKeepaliveModule.forRoot(),
        SharedModule
    ],
    declarations: [ 
        NavbarComponent,
    ],
    exports: [ 
        NavbarComponent 
    ],
    providers : [
    ]
})

export class NavbarModule {}
