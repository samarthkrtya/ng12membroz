import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable, Subject } from 'rxjs';

import { CommonService } from '../../../../core/services/common/common.service';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { BasicValidators, OnlyPositiveNumberValidator } from '../../../../shared/components/basicValidators';

declare var $: any;
import swal from 'sweetalert2';
import { map, startWith, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-event-booking',
  templateUrl: './event-booking.component.html'
})
export class EventBookingComponent extends BaseLiteComponemntComponent implements OnInit, BaseComponemntInterface {

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  arr: FormArray;

  submitted: boolean;
  isLoading: boolean;
  bindid: any;

  today: Date = new Date();

  submitVisibility: boolean = false;

  currentRoleDetail: any;
  isMemberLogin: boolean = false;
  currUserid: any;

  status: string;
  isLoad: boolean;
  redirectUrl: string;
  filteredOptions: Observable<string[]>;
  customerid = new FormControl();
  contactLists: any[] = [];
  selectedAction: any;
  customerIds: any;

  eventfields = {
    "fieldname": "eventid",
    "fieldtype": "form",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
    ],
    "form": {
      "apiurl": "events/filter",
      "formfield": "_id",
      "displayvalue": "title",
    },
    "method": "POST",
    "dbvalue": "",
  }


  htmlContent: string = `<div class="row"> <div class="col-md-12">
  <div class="border p-3 rounded alternative-light-blue">
    <div class="row">
      <div class="col-sm-4">
          <div class="media member-profile-item"><img  src='$[{profilepic}]' class="profile-avatar-img mr-2 rounded-circle" alt="">
          <div class="media-body"><div class="font-500 mb-1"> $[{fullname}] </div> <div class="@START[{membershipid.membershipname}]"> <div class="d-flex"><div class="flex-grow-1">  $[{membershipid.membershipname}]</div> </div> </div></div> </div>
        </div>
        <div class="col-sm-4 @START[{property.address}]">
            <div class="d-flex"><div class="mr-2"><img src="../assets/img/location-gray-icon.svg" alt=""></div><div> $[{property.address}]   <br>  $[{property.city}] </div></div>
        </div>
        <div class="col-sm-4">
           <div class="@START[{primaryemail}]"> <div class="d-flex align-items-center mb-3"><div class="mr-2"><img src="../assets/img/email-gray-icon.svg" alt=""></div><div>$[{primaryemail}]</div></div> </div>
           <div class="@START[{mobile}]"> <div class="d-flex align-items-center mb-3"><div class="mr-2"><img src="../assets/img/phone-gray-icon.svg" alt=""></div><div> $[{mobile}] </div></div> </div>
        </div>
    </div>
    </div>
    </div>
  </div>`;

  billitems: any[] = [];
  billitemsArray: any[] = [];


  constructor(
    private _route: ActivatedRoute,
    private _commonService: CommonService,
    private fb: FormBuilder,
  ) {
    super();

    this.form = fb.group({
      'eventid': [, Validators.required],
      'customerid': [, Validators.required],
      'onModel': [, Validators.required],
      'bookingdate': [this.today],
      'startdate': [],
      'enddate': [],
      'status': ['active'],
      'notes': [''],
      'occupants': this.fb.array([]),
    });

    this._route.params.forEach((params) => {
      this.bindid = params["id"];
    });
  }

  createItem() {
    return this.fb.group({
      itemid: [, Validators.required],
      occupanttype: [, Validators.required],
      cost: [],
      totalcost: [, Validators.required],
      quantity: [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])]
    });
  }

  async ngOnInit() {
    try {
      this.isLoading = true;
      await super.ngOnInit();
      await this.initializeVariables();
      await this.getContactLists();

      this.filteredOptions = this.customerid.valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : option.nickname),
          map(option => option ? this.filter(option) : this.contactLists.slice())
        );



      if (this.bindid) {
        this.isLoad = false;
        await this.LoadData();
      } else {
        this.isLoad = true;
      }
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error(error);
    } finally {
    }
  }


  async getContactLists() {

    this.isLoading = true;
    var url = "common/contacts/filter";
    var method = "POST";
    var type = this.selectedAction == 'member' ? 'M' : this.selectedAction == 'prospect' ? 'C' : this.selectedAction == 'user' ? 'U' : undefined;

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "branchid", searchvalue: this._loginUserBranchId, criteria: "eq", datatype: "ObjectId" });

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data) {

          this.contactLists = data;
          this.contactLists.map(p => p.src = p.profilepic ? p.profilepic : '../../assets/img/default-avatar.png')
          this.isLoading = false;

          if (this.customerIds) {
            var custobj = this.contactLists.find(p => p._id == this.customerIds);
            if (custobj) {
              this.customerid.setValue(custobj);
            }
          }
        }
      }, (error) => {
        console.error(error);
      });
  }

  displayCusFn(user: any): string {
    return user && user.nickname ? user.nickname : '';
  }

  private filter(value: string): string[] {
    let results;
    if (value) {
      results = this.contactLists
        .filter(option => {
          if (option.nickname) {
            //return option.nickname.toLowerCase().indexOf(value.toLowerCase()) === 0
            return option.nickname.toLowerCase().includes(value.toLowerCase())
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.contactLists.slice();
    }
    return results;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {

    if (this._authService.currentUser != undefined && this._authService.currentUser.role != undefined) {
      this.currentRoleDetail = this._authService.currentUser.role;
      if (this.currentRoleDetail) {
        if (this.currentRoleDetail.roletype != undefined) {
          if (this.currentRoleDetail.roletype == 'M') {
            this.isMemberLogin = true;
            if (this._authService.auth_id != undefined) {
              this.currUserid = this._authService.auth_id;
            }
          } else {
            this.isMemberLogin = false;
          }
        }
      }
    }

    this.billitems = [];
    this.billitemsArray = [];
    return;
  }


  newTickets() {
    let formArray = <FormArray>this.form.controls.occupants;
    if (this.billitemsArray[this.billitemsArray.length - 1].length > 1) {
      let itm;
      this.billitemsArray[formArray.length] = [];
      this.billitems.forEach((b) => {
        itm = formArray.controls.find(a => a.get("itemid").value == b.itemid._id);
        if (!itm) {
          this.billitemsArray[formArray.length].push(b);
        }
      });
      formArray.push(this.createItem());
    }
  }

  deleteTickets(ind: number) {
    let formArray = <FormArray>this.form.controls.occupants;
    let itemid = formArray.at(ind).get('itemid').value;
    this.billitemsArray[this.billitemsArray.length - 1].push(this.billitems.find(a => a.itemid._id == itemid));
    formArray.removeAt(ind);
  }

  inputModelChangeValue(event: any) {
    if (this.isLoad) {
      this.billitems = [];
      this.billitemsArray = [];
      this.form.controls['startdate'].setValue(null);
      this.form.controls['enddate'].setValue(null);
      if (event) {
        if (event && event.tickets && event.tickets.length > 0) {
          this.billitems = event.tickets;
          this.billitemsArray[0] = [];
          this.billitemsArray[0] = event.tickets;
          let control = <FormArray>this.form.controls.occupants;
          control.clear();
          control.push(this.createItem());
        } else {
          this.submitVisibility = true;
          super.showNotification("top", "right", "Event tickets are not setup, Please setup tickets first!!", "danger");
          this._router.navigate(['/pages/event/event-view/' + event._id]);
        }
        this.form.controls['startdate'].setValue(event.property.startdate);
        if (event.property.enddate) {
          this.form.controls['enddate'].setValue(event.property.enddate);
          this.form.controls['enddate'].disable();
        }
        this.form.controls['startdate'].disable();
      }
      this.createItem();
    }
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  eventTypeChange(item: any, index: any) {

    var obj = this.billitems.find(p => p.tickettype.toLowerCase() == item.value.toLowerCase());

    if (obj) {
      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('itemid').patchValue(obj.itemid._id);
      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('cost').patchValue(obj.cost);
      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('quantity').patchValue(1);
      var totalCost = Number(obj.cost) * 1;
      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('totalcost').patchValue(totalCost);

      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('occupanttype').disable();
      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('cost').disable();
      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('totalcost').disable();

    }
  }

  onPersonChange(item: any, index: any) {

    var arrayControl = this.form.get("occupants") as FormArray;
    var selectedItem = arrayControl.at(index);

    if (selectedItem["controls"]["itemid"]["value"] !== null) {
      var totalCost = Number(selectedItem["controls"]["quantity"]["value"]) * Number(selectedItem["controls"]["cost"]["value"]);
      ((this.form.get('occupants') as FormArray).at(index) as FormGroup).get('totalcost').patchValue(totalCost);
    } else {
      this.showNotification("top", "right", "Type Cannt be empty!!!", "danger");
    }
  }


  onCustomerSelected(value: any) {


    if (value && value._id) {
      let onModel;
      switch (value.type) {
        case "M":
          onModel = "Member";
          this.redirectUrl = '/pages/members/profile/' + value._id;
          break;
        case "C":
          onModel = "Prospect";
          this.redirectUrl = '/pages/customer-module/profile/' + value._id;
          break;
        case "U":
          onModel = "User";
          break;
        default:
          onModel = "Member";
      }
      this.form.controls['onModel'].setValue(onModel);
    }
  }

  async LoadData() {

    let method = "GET";
    let url = "bookings/";

    let postData = {};
    postData["search"] = [];
    postData['search'].push({ "searchfield": '_id', "searchvalue": this.bindid, "criteria": "eq", "datatype": "ObjectId" });

    return this._commonService
      .commonServiceByUrlMethodIdOrDataAsync(url, method, this.bindid)
      .then((data: any) => {
        if (data) {
          if (data.customerid) {
            var customeid = data.customerid && data.customerid._id ? data.customerid._id : data.customerid;
            var customerObj = this.contactLists.find(p => p._id == customeid);
            if (customerObj) {
              this.form.get('customerid').setValue(customerObj);
              this.customerid.setValue(customerObj);
            }
          }
          this.form.controls['onModel'].setValue(data.onModel);
          //this.customerfields.dbvalue = data.customerid;
          this.eventfields.dbvalue = data.eventid;
          this.form.controls['bookingdate'].setValue(data.bookingdate);
          this.form.controls['startdate'].setValue(data.checkin);
          this.form.controls['enddate'].setValue(data.checkout);

          if (data.eventid && data.eventid.tickets) {
            this.billitems = data.eventid.tickets;
          }
          this.billitemsArray = [];
          if (data.bookingdetail && data.bookingdetail.occupants && data.bookingdetail.occupants.length > 0) {
            let controlArray = this.form.get(["occupants"]) as FormArray;
            controlArray.clear();
            for (let i = 0; i < data.bookingdetail.occupants.length; i++) {
              var id = data.bookingdetail.occupants[i].itemid && data.bookingdetail.occupants[i].itemid._id ? data.bookingdetail.occupants[i].itemid._id : null;
              controlArray.push(this.fb.group({
                itemid: [id, Validators.required],
                occupanttype: [{ value: data.bookingdetail.occupants[i].occupanttype, disabled: true }, Validators.required],
                cost: [{ value: data.bookingdetail.occupants[i].cost, disabled: true }],
                quantity: [data.bookingdetail.occupants[i].quantity, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
                totalcost: [{ value: data.bookingdetail.occupants[i].totalcost, disabled: true }],
              })
              );
              this.billitemsArray[i] = [];
              this.billitemsArray[i] = this.billitems;
            }
          }
          if (data.status && (data.status == 'confirmed' || data.status == 'cancelled')) {
            this.submitVisibility = true;
          }
          setTimeout(() => {
            this.isLoad = true;
          }, 5000);
          return;
        }
      });
  }

  onlinePay() {
    var ishttps: boolean = false;
    if (location.protocol == "https:") {
      ishttps = true;
    }
    var url = `http://pay.membroz.com/#/payment-prev?bookingid=${this.bindid}&https=${ishttps}&domain=${location.hostname}`;
    console.log("url", url);
    window.open(url, '_blank');
  }


  cancelbookingform() {
    this._router.navigate(['/pages/dynamic-list/list/eventbooking']);
  }

  cancelBooking() {

    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancelled it!',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        var model = {};
        model['status'] = 'cancelled';
        this.submitVisibility = true;

        let method = "PATCH";
        let url = "bookings/";

        this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model, this.bindid)
          .then((data) => {
            super.showNotification("top", "right", "Booking cancelled successfully !!", "success");
            this.submitVisibility = false;
            this._router.navigate(['/pages/dynamic-list/list/eventbooking']);
          }).catch((e) => {
            super.showNotification("top", "right", "Something went wrong !!", "danger");
            this.submitVisibility = false;
          });
      }
    });
  }

  customerSelected(event: any) {

    if (event && event.value) {
      this.customerid.setValue(event.value);
      this.form.get("customerid").setValue(event.value);

      if (event.value && event.value.type) {
        let onModel;
        switch (event.value.type) {
          case "M":
            onModel = "Member";
            break;
          case "C":
            onModel = "Prospect";
            break;
          case "U":
            onModel = "User";
            break;
          default:
            onModel = "Member";
        }
        this.form.controls['onModel'].setValue(onModel);
      }

    }
  }

  public async onSubmit(value: any, valid: boolean) {

    console.log("value", value)
    this.submitted = true;
    if (!valid) {
      this.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }

    let method = this.bindid ? "PUT" : "POST";
    let url = "bookings/";

    value = this.form.getRawValue();

    var model = {};
    model['eventid'] = value.eventid;
    model['bookingdetail'] = {};
    model['bookingdetail']['occupants'] = [];
    model['bookingdetail']['bookingcost'] = value.occupants.map(item => item.totalcost).reduce((prev, next) => prev + next);
    model['bookingdetail']['totalrooms'] = value.occupants.map(item => item.quantity).reduce((prev, next) => prev + next);
    model['bookingdetail']['occupants'] = value.occupants;

    model['customerid'] = value.customerid._id;
    model['onModel'] = value.onModel;
    model['bookingdate'] = value.bookingdate && value.bookingdate._d ? value.bookingdate._d : value.bookingdate;
    model['checkin'] = value.startdate && value.startdate._d ? value.startdate._d : value.startdate;
    model['checkout'] = value.startdate && value.startdate._d ? value.startdate._d : value.startdate;
    model['property'] = {};
    model['property'] = value.property;
    model['status'] = this.status;

    this.submitVisibility = true;
    //console.log("model", model);


    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.bindid)
      .then((data: any) => {

        if (data) {
          this.showNotification('top', 'right', 'Booking done successfully!!!', 'success');
          this.submitVisibility = false;
          if (data.billid && data.billid._id.length > 0) {
            this._router.navigate(['/pages/event/booking-payment/' + data.billid._id]);
          } else {
            this._router.navigate(['/pages/dynamic-list/list/eventbooking']);
          }
        }
        return;
      }).catch((e) => {
        this.submitVisibility = false;
      });
  }

  setdigit(val: number) {
    var ret;
    if (val <= 9) {
      ret = `0${val}`;
    } else {
      ret = `${val}`;
    }
    return ret;
  }

}
