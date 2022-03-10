import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

import { Component, OnDestroy, OnInit, ViewChild, Input, HostListener, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Subject } from 'rxjs'; 

import { MatSort } from '@angular/material/sort';
import { MatPaginator } from "@angular/material/paginator";
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { MatCheckboxChange } from "@angular/material/checkbox";

import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import * as moment from 'moment'; 

import { CommonService } from '../../../../../../core/services/common/common.service';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-conversion-product-details',
  templateUrl: './conversion-product-details.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ConversionProductDetailsComponent),
      multi: true
    }
  ]
})
export class ConversionProductDetailsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() submitted: Boolean;
  @Input() disabled = false;
  

  destroy$: Subject<boolean> = new Subject<boolean>();

  form_fields = {
    "fieldname": "membershipid",
    "fieldtype": "form",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "property.type", "searchvalue": false, "criteria": "exists" },
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "membershipname", "value": 1 },
      { "fieldname": "property", "value": 1 },
    ],
    "form": {
      "apiurl": "memberships/filter",
      "formfield": "_id",
      "displayvalue": "membershipname",
    },
    "method": "POST",
    "dbvalue": {}
  }

  membershipid: any;
  membershipstart: Date;
  membershipend: Date;
  disableBtn: boolean = false;

  displayedColumns: string[] = ['item', 'period', 'tenure','amount', 'discount', 'taxamount', 'totalamount'];
  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource;
  selection = new SelectionModel;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort = {} as MatSort;

  /** Implementation of ControlValueAccessor */
  onChange: (users: any) => void = (users: any) => {};

  /** Implementation of ControlValueAccessor */
  @HostListener("focusout")
  onTouched: () => void = () => {};


  constructor(
    private _commonService: CommonService
  ) { 
    super()
  }

  async ngOnInit() {
    try {
      await super.ngOnInit()
      
    } catch(error) {

    } finally {

    }
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  /** Implementation of ControlValueAccessor */
  writeValue(users: any | null | undefined) {
    if (!users) {
      this.selection.clear();
    } else {
      const ids: number[] = users.map(u => u.id);
      this.selection.select(...ids);
    }
  }

  /** Implementation of ControlValueAccessor */
  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  /** Implementation of ControlValueAccessor */
  registerOnChange(fn: (users: any) => void) {
    this.onChange = fn;
  }

  /** Implementation of ControlValueAccessor */
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  async inputModelChangeValue(value: any) {
    if (value && value._id) {
      this.membershipid = value;
      await this.getPaymentTerms()
    } else {
      this.membershipid = null;
      this.dataSource = new MatTableDataSource();
    }
  }

  async getPaymentTerms() {

    let method = "POST";
    let url = "paymentterms/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "membershipid", "searchvalue": this.membershipid._id, "criteria": "eq" });
     
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) { 
          this.dataSource = data;
          data.forEach(elePaymentTerms => {
            elePaymentTerms['payment'] = false;
            let amount = elePaymentTerms.amount;
            if (elePaymentTerms.discount != undefined && elePaymentTerms.discount != 0) {
              amount -= elePaymentTerms.discount;
            }
            elePaymentTerms.taxamount = 0;
            elePaymentTerms.totalamount = 0;
            if (elePaymentTerms.taxes && elePaymentTerms.taxes.length !== 0) {
              elePaymentTerms.taxamount = this._commonService.calTaxes(elePaymentTerms.taxes, amount);
            }
            elePaymentTerms.totalamount = amount + elePaymentTerms.taxamount;
            elePaymentTerms.isedit = false;
          });

          this.dataSource = new MatTableDataSource();
          this.dataSource = new MatTableDataSource(data);
          this.selection = new SelectionModel(true, []);
          this.dataSource.sort = this.sort;

          return;
          
        }
      }, (error) => {
        console.error(error);
        
      })
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {

    if (this.isAllSelected()) {
      this.selection.clear();
      this.onChange([]);
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
      this.onChange(this.dataSource.data);
    }

    this.onTouched();

  }

  _setSelection(change: MatCheckboxChange, row: any) {
    
    if (change) {
      this.selection.toggle(row);
    }

    this.onChange(this.selection.selected);
    this.onTouched();
  }

  ChangeDate(event: any) {
    if (!this.membershipid) {
      this.showNotification('top', 'right', 'Please choose any membership', 'danger');
      return;
    }
    if (event) {
      this.membershipstart = event.value['_d'];
      this.formGroup.controls['membershipstart'].setValue(this.membershipstart);
      var newDate = new Date(this.membershipstart);
      if (this.membershipstart != undefined && this.membershipstart != null) {
        if (this.membershipid.autocomplete_id == undefined) {
          this.showNotification('top', 'right', 'Please choose any membership', 'danger');
          return;
        } else {
          if (this.membershipid.periodin != undefined) {
            if (this.membershipid.periodin == "Year") {
              newDate.setFullYear(this.membershipstart.getFullYear() + this.membershipid.tenure)
            }
            if (this.membershipid.periodin == "Month") {
              var endDateMoment = moment(newDate);                               // ADDED
              endDateMoment.add(this.membershipid.tenure, 'months');             // ADDED
              newDate = endDateMoment.toDate();                                  // ADDED
              // newDate.setMonth(this.membershipstart.getMonth() + this.membershipid.tenure)
            }
          } else if (this.membershipid.property != undefined && this.membershipid.property.tenure_month != undefined) {
            let monthinc: number = 0;
            let ten: number = this.membershipid.property.tenure_month;
            monthinc += Number(ten);
            let selectedten: number = this.membershipstart.getMonth();
            monthinc += Number(selectedten);
            var endDateMoment = moment(newDate);         // ADDED
            endDateMoment.add(ten, 'months');            // ADDED
            newDate = endDateMoment.toDate();            // ADDED
            // newDate.setMonth(monthinc);
          } else if (this.membershipid.property != undefined && this.membershipid.property.tenure_year != undefined) {
            let yearinc: number = 0;
            let ten: number = this.membershipid.property.tenure_year;
            yearinc += Number(ten);
            let selectedten: number = this.membershipstart.getFullYear();
            yearinc += Number(selectedten);
            newDate.setFullYear(yearinc);
          } else if (this.membershipid.property && this.membershipid.property.tenure) {
            let monthinc: number = 0;
            let ten: number = this.membershipid.property.tenure;
            monthinc += Number(ten);
            let selectedten: number = this.membershipstart.getMonth();
            monthinc += Number(selectedten);
            var endDateMoment = moment(newDate);         // ADDED
            endDateMoment.add(ten, 'months');            // ADDED
            newDate = endDateMoment.toDate();            // ADDED
            // newDate.setMonth(monthinc);
          }
          newDate.setDate(this.membershipstart.getDate() - 1);
          this.formGroup.controls['membershipend'].setValue(newDate);
        }
      }
    }
  }

}
