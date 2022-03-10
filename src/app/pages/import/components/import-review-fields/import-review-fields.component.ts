import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Http, Headers } from '@angular/http';
import { CommonDataService } from '../../../../core/services/common/common-data.service';


@Component({
  selector: 'app-import-review-fields',
  templateUrl: './import-review-fields.component.html'
})
export class ImportReviewFieldsComponent implements OnInit {

  // addedRecoredCount: number;

  submitBtnDisable: boolean = false;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _commonDataService: CommonDataService,
  ) { 

  }

  @Input('bindId') bindIdValue: any;
  @Input('param') paramValue: any;
  @Input('returnUrl') returnUrlValue: any;
  @Input('isFilterListing') isFilterListingValue: any;
  @Input('reviwedData') reviwedDataValue: any[] = [];
  @Input('importFields') importFieldsValue: any[] = [];
  @Output() reviewSubmitData: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
    this.submitBtnDisable = false;
  }

  uploadAgain(){

    if(this.isFilterListingValue) {
      this._commonDataService.isfilterDataForDynamicPages = true;
    }

    if(this.paramValue) {
      this._router.navigate(['/pages/import/' + this.bindIdValue]);
    } else {
      this._router.navigate(['/pages/import/' + this.bindIdValue + '/upload']);
    }
  }

  reviewData() {
    this.submitBtnDisable = true;
    let postData = "submit";
    this.reviewSubmitData.emit(postData);
  }

}
