import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { ImportService } from '../../../../core/services/import/import.service';

import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-import-data-render',
  templateUrl: './import-data-render.component.html',
})
export class ImportDataRenderComponent extends BaseLiteComponemntComponent implements OnInit {

  submitBtnDisable: boolean = true;
  importData: any [] = [];
  displayRecord: any [] = [];
  isLoading = true;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _importService: ImportService,
  ) { 
    super();
  }

  @Input('importUrl') importUrl: any;
  @Input('importFields') importFields: any[] = [];
  @Input('selectedFileExtension') selectedFileExtension: any;
  @Input('original_filename') original_filename: any;
  @Input('returnUrl') returnUrlValue: any;
  @Input('formId') formId: any;
  @Output() importSubmitData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
    
    try {
      await super.ngOnInit();
      await this.initializeVaraibale();
      await this.getImportedData();
    } catch (error) {
      console.error("error")
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVaraibale() {
    this.importData = [];
    this.displayRecord = [];
    this.submitBtnDisable = true;
    this.isLoading = true;
    return;
  }

  async getImportedData() {

    let postData = { filename: this.importUrl, formid: this.formId };
    return this._importService
      .AsyncgetAlldata(postData)
      .then((data: any)=>{
        if(data) {
          this.importData = data;
          this.displayRecord = this.importData.slice(0, 10);
          this.submitBtnDisable = false;
          this.isLoading = false;
          return;
        }
    },(err) =>{
      console.error("err", err);
    })
  }

  dataReview() {
    this.submitBtnDisable = true;
    this.isLoading = true;
    this.importSubmitData.emit(this.importData);
  }

  getColumnData(head: any, i: any): string {
    return this.importData[i][head];
  }
}