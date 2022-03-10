import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
 
import { CommonService } from 'src/app/core/services/common/common.service';
import { BillpaymentsComponent } from './billpayments.component';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router'; 
 

 
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    SharedModule,
    RouterModule,
  ],
  declarations: [
    BillpaymentsComponent,  
  ],
  exports:[
    BillpaymentsComponent, 
  ],
  providers: [
    CommonService,
    CurrencyPipe
  ]
})
export class BillPaymentsModule { }
