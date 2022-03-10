import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { routing } from "./form-detail-routing";
import { FormDetailComponent } from "./form-detail.component";
import { AppMaterialModule } from "../../../../app-material/app-material.module";
import { ItemListModule } from "../../../../shared/item-list/item-list.module";
import { SharedModule } from "../../../../shared/shared.module";
import { PagerService } from "src/app/core/services/common/pager.service";
import { FormBasicDetailsComponent } from "./form-basic-details/form-basic-details.component";
import { SearchPipe } from "./search.pipe";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormlistService } from "src/app/core/services/formlist/formlist.service";
import { DynamicOperationModule } from "src/app/shared/dynamic-operation/dynamic-operation.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    DynamicOperationModule, // added
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  declarations: [
    FormDetailComponent,
    FormBasicDetailsComponent, 
    SearchPipe,
  ],

  providers: [PagerService, FormlistService],
})
export class FormDetailModule {}
