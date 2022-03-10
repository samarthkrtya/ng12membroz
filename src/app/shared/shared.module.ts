import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { SharedRoutingModule } from './shared-routing.module';
import { MyCurrencyPipe } from './components/currency.pipe';
import { NumberToWordsPipe } from './components/number-to-words.pipe';

import { AppMaterialModule } from '../app-material/app-material.module';
import { dateLocalePipe } from './components/datelocale.pipe';
import { SafeHtmlPipe } from './components/safehtml.pipe';
import { KeysPipe } from './components/keys.pipe'; 
import { SanitizeHtmlPipe } from './components/sanitize-html.pipe';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    SharedRoutingModule,
    AppMaterialModule,
    HttpClientModule
  ],
  declarations: [
    MyCurrencyPipe,
    NumberToWordsPipe,
    dateLocalePipe, 
    SafeHtmlPipe,
    KeysPipe,
    SanitizeHtmlPipe,
  ],
  exports : [
    MyCurrencyPipe,
    KeysPipe,
    SafeHtmlPipe,
    NumberToWordsPipe,
    AppMaterialModule,
    ReactiveFormsModule,
    dateLocalePipe,
    SanitizeHtmlPipe
  ],
})
export class SharedModule {
  static forRoot(): ModuleWithProviders <SharedModule>{
    return {
      ngModule: SharedModule,
    };
  }
}
