import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BookingModel } from '../../../../core/models/service/booking';
import { LookupsService } from '../../../../core/services/lookups/lookup.service';
import { BookingService } from '../../../../core/services/service/booking.service';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import swal from 'sweetalert2';

@Component({
  selector: 'app-booking-view',
  templateUrl: './booking-view.component.html'
})
export class BookingViewComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();

  bookingModel = new BookingModel()

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = true;
  bindId: any;

  customerDetail: any;
  dataContent: any;

  addonsList: any = [];
  vendorList: any = [];

  dataHtml: string = '<div class="media-body"><div class="font-500 mb-1">$[{prefix}]-$[{bookingnumber}]</div><div class="d-flex"><div class="flex-grow-1">  $[{customerid.fullname}]</div> <div class="text-danger">$[{status}]</div></div></div>';

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,

    private _lookupsService: LookupsService,
    private _bookingService: BookingService,
  ) {
    super();

    this.form = this.fb.group({
      'bookingcost': [0, Validators.required],
      'costperroom': [0],
      'vendor': [''],
      'addons': [[]],
      'note': [],
    });

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = 'booking-view';
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();
  }

  ngAfterViewInit() {
  }

  async LoadData() {
    this.isLoading = true;
    this.getLookUpData();
    if (this.bindId) {
      await this.getBookingByid(this.bindId);
    }
    this.isLoading = false;
  }

  getLookUpData() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "lookup", "searchvalue": ["Booking Vendor", "Booking Meal Type"], "criteria": "in", "datatype": "string" });

    this._lookupsService
      .GetByfilterLookupName(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((lookupData: any[]) => {
        this.addonsList = [];
        this.vendorList = [];
        this.addonsList = lookupData.find(a => a.lookup == "Booking Meal Type")['data'];
        this.vendorList = lookupData.find(a => a.lookup == "Booking Vendor")['data'];
      });
  }

  async getBookingByid(id: any) {
    await this._bookingService
      .AsyncGetById(id)
      .then((data: any) => {
        
        this.customerDetail = data.customerid;
        this.dataContent = data;

        this.form.controls['bookingcost'].setValue(data.confirmationdetail.bookingcost);
        this.form.controls['costperroom'].setValue(data.confirmationdetail.costperroom);
        this.form.controls['vendor'].setValue(data.confirmationdetail.vendor);
        this.form.controls['addons'].setValue(data.confirmationdetail.addons);
        this.form.controls['note'].setValue(data.confirmationdetail.note);

      });
  }

  async Save(model?: BookingModel) {
    return await this._bookingService.AsyncAdd(model);
  }

  async Update(id?: any, model?: BookingModel) {
    return await this._bookingService.AsyncUpdate(id, model);
  }

  async onSubmit(value: any, valid: boolean, status: string) {
    
    if (status == 'confirmed') {
      this.submitted = true;
      if (!valid) {
        super.showNotification("top", "right", "Enter required fields !!", "danger");
        return;
      }
    }
    const varTemp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this document !!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${status} it!`,
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then(async (result: any) => {

      if (result.value) {
        varTemp.bookingModel = varTemp.dataContent;

        varTemp.bookingModel.customerid = varTemp.dataContent.customerid._id;
        varTemp.bookingModel.locationid = varTemp.dataContent.locationid._id;
        if (varTemp.dataContent.resortid && varTemp.dataContent.resortid._id)
          varTemp.bookingModel.resortid = varTemp.dataContent.resortid._id;

        varTemp.bookingModel.confirmationdetail = {};
        varTemp.bookingModel.confirmationdetail['bookingcost'] = value.bookingcost;
        varTemp.bookingModel.confirmationdetail['costperroom'] = value.costperroom;
        varTemp.bookingModel.confirmationdetail['vendor'] = value.vendor;
        varTemp.bookingModel.confirmationdetail['addons'] = value.addons;
        varTemp.bookingModel.confirmationdetail['note'] = value.note;
        varTemp.bookingModel.status = status;

        
        try {
          var res;
          if (!varTemp.bindId) {
            res = await varTemp.Save(varTemp.bookingModel);
          } else {
            res = await varTemp.Update(varTemp.bindId, varTemp.bookingModel);
          }
          
          varTemp._router.navigate(['/pages/dynamic-list/list/booking']);
          super.showNotification("top", "right", `Booking ${status} successfully  !!`, "success");
          varTemp.disableButton = false;
        } catch (e) {
          super.showNotification("top", "right", "Error Occured !!", "danger");
          varTemp.disableButton = false;
        }
      }
    })

  }

  ActionCall() { }
  Delete() { }

  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }



}

