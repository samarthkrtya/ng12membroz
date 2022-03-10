import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './opening-balances.routing';
import { OpeningBalancesComponent } from './opening-balances.component';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { FinanceService } from 'src/app/core/services/finance/finance.service';
import { JournalService } from 'src/app/core/services/finance/journal.service';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    routing,
    ReactiveFormsModule,
    AppMaterialModule,


  ],
  declarations: [
    OpeningBalancesComponent,
  ],
  providers: [
    FinanceService,
    JournalService
  ]
})
export class OpeningBalancesModule { }

