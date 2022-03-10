import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FormdataRoutes } from './formdata-routing';
import { FormdataComponent } from './formdata.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(FormdataRoutes),
  ],
  declarations: [
    FormdataComponent
  ],
})
export class FormdataModule { }