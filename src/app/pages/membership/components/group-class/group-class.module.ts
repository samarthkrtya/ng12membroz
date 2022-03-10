import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './group-class-routing';
import { Groupclass } from './group-class.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'
import { GroupclassService } from '../../../../core/services/groupclass/groupclass.service';
import { MemberService } from '../../../../core/services/member/member.service';
import { SharedModule } from '../../../../shared/shared.module';
import { ClassMembersComponent } from './class-members/class-members.component';
import { DynamicSubListModule } from 'src/app/shared/dynamic-sublist/dynamic-sublist.module';
import { ClassWaitingComponent } from './class-waiting/class-waiting.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    SharedModule,
    DynamicSubListModule,
  ],
  declarations: [
    Groupclass,
    ClassMembersComponent,
    ClassWaitingComponent
  ],
  providers: [
    GroupclassService,
    MemberService
  ]
})
export class GroupclassModule { }
