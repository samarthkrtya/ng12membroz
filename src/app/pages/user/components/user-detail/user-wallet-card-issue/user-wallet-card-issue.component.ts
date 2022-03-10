
import {AbstractControl, FormBuilder, FormControl, FormGroup, FormGroupDirective, ValidatorFn, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';


import { Subject } from 'rxjs';

import { date } from 'joi';

import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";
import {SelectionModel} from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from 'src/app/core/services/common/common.service';

export interface memberWalletModel {
  cardnumber: string,
  principal: boolean,
  holder: string,
  expirydate: Date,
  status: string
}

declare var $: any;

function autocompleteStringValidator(validOptions: Array<string>): ValidatorFn {

  return (control: AbstractControl): { [key: string]: any } | null => {
    if (validOptions.indexOf(control.value) !== -1) {
      return null  /* valid option selected */
    }
    return { 'invalidAutocompleteString': { value: control.value } }
  }
}


@Component({
  selector: 'app-user-wallet-card-issue',
  templateUrl: './user-wallet-card-issue.component.html',
  styles: [
    `table {
      width: 100%;
    }

    th.mat-sort-header-sorted {
      color: black;
    }

    .color-green {
      color: green
    }

    .color-red {
      color: red !important
    }

    .hidetext { -webkit-text-security: disc; /* Default */ }`
  ]
})
export class UserWalletCardIssueComponent extends BaseLiteComponemntComponent implements OnInit {

  form: FormGroup;
  submitted: boolean;

  walletform: FormGroup;
  walletsubmitted: boolean;

  displayedColumns: string[] = ['cardnumber', 'principal', 'holder', 'expirydate', 'status'];
  //dataSource = new MatTableDataSource<memberWalletModel>(ELEMENT_DATA);


  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort = {} as MatSort;

  destroy$: Subject<boolean> = new Subject<boolean>();

  wallets: any [] = [];
  disableBtn: boolean = false;
  walletdisableBtn: boolean = false;

  ELEMENT_DATA: any [] = [];
  dataSource = new MatTableDataSource;
  selection = new SelectionModel;

  holder = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
  ) {
      super();
      this.pagename="app-member-wallet";

      this.form = this.fb.group({
        'cardnumber': ['', Validators.compose([Validators.required, Validators.minLength(10)])],
        'holder': [this.holder],
        'expirydate': ['', Validators.required],
      });

      this.walletform = this.fb.group({
        'creditpoint': ['', Validators.required],
      });

   }

  @Input() dataContent: any;
  @Output() onIssueCard = new EventEmitter();
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;


  public validation_msgs = {

    'holder': [
      { type: 'invalidAutocompleteString', message: 'Cardholder Name not recognized. Click one of the autocomplete options.' },
      { type: 'required', message: 'Cardholder Name is required.' }
    ],

  }


  async ngOnInit() {


    try {
      await super.ngOnInit();
      await this.initializeVariables();
      await this.loadData()
    } catch(error) {
    } finally {
      console.log("dataContent", this.dataContent);
    }

    this.filteredOptions = this.holder.valueChanges.pipe(
      startWith(''),
      map(value => this._filterHolderLabels(value))
    )

  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();

    if (this.dataSource) {
      this.dataSource.disconnect();
    }

  }

  ngAfterViewInit() {

    // this.changeDetectorRef.detectChanges();
    // this.dataSource.paginator = this.paginator;
    //this.obs = this.dataSource.connect();

    this.dataSource.sort = this.sort;

  }

  async initializeVariables() {

    this.wallets = [];
    if(this.dataContent && this.dataContent.wallets && this.dataContent.wallets.length > 0) {
      this.wallets = this.dataContent.wallets;
      this.ELEMENT_DATA = [...this.dataContent.wallets];
      console.log("ELEMENT_DATA", this.ELEMENT_DATA);
      this.dataSource = new MatTableDataSource();
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.selection = new SelectionModel(true, []);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    this.disableBtn = false;
    this.walletdisableBtn = false;

    this.options = [];

    // this.holder.setValue(null)
    // this.form.get("holder").setValue(null);

    this.options.push(this.dataContent.fullname);
    if(this.dataContent && this.dataContent.property && this.dataContent.property.familygroup && this.dataContent.property.familygroup.length > 0) {
      this.dataContent.property.familygroup.forEach(element => {
        this.options.push(element.fullname);
      });
    }

    if(this.options && this.options.length > 0) {

      this.holder = new FormControl('',
      { validators: [autocompleteStringValidator(this.options), Validators.required] })

    }
    return;
  }

  async loadData() {
    return
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

  }

  private _filterHolderLabels(label: string): string[] {
    if (label === '' || label == null) {
      return this.options.slice()
    }
    const filterValue = label.toLowerCase()
    return this.options.filter(option => option.toLowerCase().includes(filterValue))
  }

  async onSubmit(value: any, valid: boolean) {

    this.submitted = true;

    if (!valid) {
      super.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }

    if(this.holder.hasError('required')) {
      return;
    }

    if(this.holder.hasError('invalidAutocompleteString')) {
      return;
    }


    value.principal = false;

    if(this.dataContent && this.dataContent.wallets && this.dataContent.wallets.length > 0) {
      var walletHolderObj = this.dataContent.wallets.find(p=>p.holder == this.holder.value);
      if(walletHolderObj) {
        super.showNotification("top", "right", "cardholder Name alreay exists!!!", "danger");
        return;
      }

      var walletcardnumberObj = this.dataContent.wallets.find(p=>p.cardnumber == value.cardnumber);
      if(walletcardnumberObj) {
        super.showNotification("top", "right", "Card Number alreay exists!!!", "danger");
        return;
      }

    }

    if(this.dataContent.fullname == this.holder.value) {
      value.principal = true
    }

    this.disableBtn = true;

    let method = "PATCH";
    let url = "members/" + this.dataContent._id;

    let postData = {};
    postData["wallets"] = [];

    postData["wallets"] = this.wallets;
    postData["wallets"].push({ cardnumber: value.cardnumber, principal: value.principal, holder: this.holder.value, expirydate: new Date(value.expirydate), status: "active" });

    console.log("postData", postData);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          console.log("data", data);

          $(".close").click();
          setTimeout(() => {
            super.showNotification("top", "right", "Card has been issued successfully", "success");
            this.onIssueCard.emit(data);
          }, 1000);

          return;
        }
      }, (error) => {
        console.error(error);
      })

  }

  async onwalletSubmit(value: any, valid: boolean) {

    this.walletsubmitted = true;

    if (!valid) {
      super.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }

    if(value.creditpoint == 0 || value.creditpoint == '') {
      this.showNotification('top', 'right', 'Credit Pts. cannot be blank or 0!!!', 'danger');
      return;
    }

    if(isNaN(value.creditpoint)){
      this.showNotification('top', 'right', 'Credit Pts. is not a number!!!', 'danger');
      return;
    }

    if(0 > value.creditpoint) {
      this.showNotification('top', 'right', 'Credit Pts. must be positive number!!!', 'danger');
      return;
    }

    this.walletdisableBtn = true;

    let method = "POST";
    let url = "bills/";

    let postData = {};
    postData["customerid"] = this.dataContent._id;
    postData["onModel"] = "Member";
    postData["billdate"] = new Date();
    postData["amount"] = 1;
    postData["totalamount"] = value.creditpoint;
    postData["taxes"] = [];
    postData["balance"] = value.creditpoint;
    postData["paidamount"] = 0;
    postData["type"] = "Wallet";
    postData["items"] = [ {
      item: {
        _id: "60a2236e48c98c3638e8b2ac",
        sale: {
          taxes: [],
          rate: 1
        }
      },
      sale: {
        taxes: [],
        rate: 1
      },
      quantity: value.creditpoint,
      cost: 1,
      totalcost: value.creditpoint
    }]
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          console.log("data", data);

          $(".walletclose").click();
          setTimeout(() => {
            super.showNotification("top", "right", "Point has been added successfully", "success");
            // this._router.navigate(['/pages/event/booking-payment/' + data._id]);
            this._router.navigate(['/pages/wallet-module/payment/' + data._id]);
              //this.onIssueCard.emit(data);
          }, 1000);

          return;
        }
      }, (error) => {
        console.error(error);
      })

  }

  addIssueNewCard() {
    if(this.dataContent  && this.dataContent.membershipend) {
      this.form.get('expirydate').setValue(new Date(this.dataContent.membershipend))
    }
  }

  cancel() {
    this.holder.reset('');
    this.form.reset()
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.form.updateValueAndValidity();
    this.submitted = false;
    setTimeout(() => this.formGroupDirective.resetForm(), 0)
  }

  walletcancel() {
    this.walletform.reset()
    this.walletform.markAsPristine();
    this.walletform.markAsUntouched();
    this.walletform.updateValueAndValidity();
    this.walletsubmitted = false;
    setTimeout(() => this.formGroupDirective.resetForm(), 0)
  }

}
