import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';

import { Observable, of, Subject } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;
import swal from 'sweetalert2';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-enrollment',
  templateUrl: './enrollment.component.html'
})

export class EnrollmentComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;
  @Input() bindId: any;
  @Input() reloadingStr: string;

  @Output() onAdded = new EventEmitter();

  displayedColumns: any[];


  @ViewChild('paginator', { read: MatPaginator }) paginator: MatPaginator;

  dataSource = new MatTableDataSource<Element>();

  isAllSelected : boolean = false;
  selectedUsers: any[] = [];
  contactList: any[] = [];

  tickets: any[] = [];


  disableBtn : boolean = false;

  filteredcontactList: any[] = [];

  formname: string = "member";

  userControl = new FormControl();
  stateChanges = new Subject<void>();
 
  sharedVisibility: boolean = false;
  isLoading: boolean = false;

  @Input() set value(value: any) {
    if (value) {
      this.selectedUsers = value;
    }
    this.stateChanges.next();
  }
 
  constructor(
    private _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-enrollment";
  }

  async ngOnInit() {
     try {
      await super.ngOnInit(); 
      await this.getData();
      await this.setData();

      this.userControl.valueChanges.pipe(
        startWith<string>(''),
        map(value => typeof value === 'string' ? value : ''),
        map(filter => this.filter(filter))
      ).subscribe(data => this.filteredcontactList = data);
      
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  filter(filter: string){
    if (filter) {
      return this.contactList.filter(option => {
        return option && option.fullname && option.fullname.toLowerCase().indexOf(filter.toLowerCase()) >= 0; 
      });
    } else {
      return this.contactList.slice();
    }
  }
 
  optionClicked(event: Event, user: any) {
    event.stopPropagation();
    this.toggleSelection(user);
  }

  toggleSelectAll(){
    this.isAllSelected = !this.isAllSelected;
    let len = this.filteredcontactList.length;
    if (this.isAllSelected){
          for ( let i=0; i<len;i++)
            this.filteredcontactList[i].selected = this.isAllSelected;
          
      this.selectedUsers = this.filteredcontactList;
    } else {
      this.selectedUsers = [];
      this.filteredcontactList.map(user => user['selected'] = this.isAllSelected)
    }
    this.userControl.setValue(this.selectedUsers);
    this.stateChanges.next();
   
  } 

  toggleSelection(user: string | object) {
      user['selected'] = !user['selected'];
      if (user['selected']) {
        this.selectedUsers.push(user);
      } else {
        const i = this.selectedUsers.findIndex(value => value._id === user['_id']);
        this.selectedUsers.splice(i, 1);
      }
     this.userControl.setValue(this.selectedUsers);
  }


 async getData(){
  
    let postData = {};
    postData["search"] = [];
    postData["search"].push({searchfield: "status", searchvalue: "active", criteria:  "eq"});
 
    let url =  "common/contacts/filter";
    let method = "POST";

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        this.contactList = [];
        let memberid;
        
        data.forEach(mbr => {
          if(mbr && mbr._id){
            memberid = this.dataContent.groupid.members.find(a=>a.memberid && a.memberid._id == mbr._id);
            if(!memberid)  this.contactList.push(mbr);
          }
        });
        this.filteredcontactList = this.contactList;
      });
  }

  async ngOnChanges() {
     if (this.reloadingStr && this.reloadingStr == 'bills') {
      this.isLoading = true;
      await this.getData();
      await this.setData();
      this.isLoading = false;
    }
  }
 
 async onClose(){
  
    let model = {};
    model["members"] = [];
    if(this.dataContent.groupid.members.length > 0){
      this.dataContent.groupid.members.forEach(exist => {
        model["members"].push({ 'memberid' : exist.memberid._id , 'onModel' : exist.onModel });
      });
    }
    
    this.selectedUsers.forEach(element => {
      model["members"].push({'memberid' : element._id , 'onModel' : element.type == 'C' ? 'Prospect' : element.type == 'U' ? 'User' : 'Member' })
    });
    
    let url =  "groupclasses";
    let method = "PATCH";


    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.dataContent.groupid._id)
      .then((data: any) => {
        // console.log("onClose==>",data);
      });
  }
 
 async onEnroll(){

  if(!this.dataContent.groupid || this.selectedUsers.length ==0){
    this.showNotification("top", "right", "Validation failed !!", "danger");
    return
  };
  if(this.tickets.filter(a=>a.checked).length == 0){
    this.showNotification("top", "right", "Please select tickets !!", "danger");
    return
  };

    var items = [], bills = [];

    this.tickets.forEach(tickts => {
      if(tickts.checked){
        items.push({ item : tickts.itemid  ,itemid  : tickts.itemid._id , sale  : tickts.itemid.sale, quantity  : tickts.quantity  });
      }
    });

    var modal = {}, bills = [];
    this.selectedUsers.forEach((concts,i) => {
      modal = {};
      modal['eventid']  = this.bindId;
      modal['customerid']  = concts._id;
      modal['onModel']  = concts.type == 'C' ? 'Prospect' : concts.type == 'U'  ? 'User' : 'Member';
      modal['billdate']  = new Date();
      modal['duedate']  = new Date();
      modal['items']  = [];
      modal['items']  = items;
      modal['amount']  = items.map(a=>a.sale).reduce((a,b)=> a.rate + b.rate);
      modal['totalamount']  = items.map(a=>a.sale).reduce((a,b)=> a.rate + b.rate);
      modal['balance']  = items.map(a=>a.sale).reduce((a,b)=> a.rate + b.rate);
      modal['type']  = 'program';
      modal['discount']  = 0;
      modal['paidamount']  = 0;
      
      bills.push(modal);
    });
    modal = {};
    modal['bills'] = bills;
    modal['customerid'] = this.selectedUsers[0]._id;
    modal['onModel'] = "Member";
    
    let url =  "bills/insertmultiple";
    let method = "POST";
    // console.log("modal==>",modal);
    this.disableBtn = true;

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, modal)
      .then( async (data: any) => {
        
          await this.onClose();
          this.showNotification("top", "right", "Enrollment  successfully !!", "success");
          this.disableBtn = false;
          this.onAdded.emit(data);
          this.closed();
        }).catch((e)=>{
          this.showNotification("top", "right", "Something went wrong !!", "danger");
          this.disableBtn = false;
          console.error("e==>",e);
        });
  }

  closed(){
    this.selectedUsers = [];
    this.userControl.setValue(this.selectedUsers);
    $("#close_enrl").click();
  }
  

  async setData() {
    
    this.tickets = [];
    if(this.dataContent.tickets && this.dataContent.tickets.length > 0){
      this.tickets = [ ...this.dataContent.tickets ] ;
      this.tickets.map((a)=>{ a.checked = false; a.quantity = 0});
    }
    this.selectedUsers = [];
    this.userControl.setValue(this.selectedUsers);
    this.displayedColumns = ['fullname', 'email', 'mobile' ];
    this.dataSource.data = [];
    if (this.dataContent.groupid && this.dataContent.groupid.members && this.dataContent.groupid.members.length > 0) {
      this.dataSource.data = this.dataContent.groupid.members.map(a=>a.memberid);
    }  
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
    return;
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.stateChanges.complete();
  }
 

  async onDelete(formname: string, id: any) {
    swal.fire({
      title: 'Are you sure?',
      text: 'You will able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove it!',
      cancelButtonText: 'No',
      customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
  }).then((result) => {
      if (result.value) {
    
     
   }
  });
 }
  
 displayFn(value: any[] | string): string | undefined {
  let displayValue: string;
  if (Array.isArray(value)) {
    value.forEach((user, index) => {
      if (index === 0) {
        displayValue = user.fullname;
      } else {
        displayValue += ', ' + user.fullname;
      }
    });
  } else {
    displayValue = value;
  }
  return displayValue;
}

}
