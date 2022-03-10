import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NotFoundComponentComponent } from './not-found-component.component';
import { NotFoundComponentRoutes } from './not-found-component-routing';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(NotFoundComponentRoutes),
    ],
    declarations: [
      NotFoundComponentComponent
    ],
    providers: [
    ]
})

export class NotFoundComponentModule {}
