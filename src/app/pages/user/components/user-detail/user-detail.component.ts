import { Component, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Subject } from 'rxjs';

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { UsersService } from '../../../../core/services/users/users.service';

import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";
import { SelectionModel } from '@angular/cdk/collections';



import swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html'
})
export class UserDetailComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();


  //dataHtml = '<img [src]="../assets/img/membroz-logo.png" class="profile-avatar-img mr-3 rounded-circle" alt=""><div class="media-body"><div class="font-500 mb-1">$[{fullname}]</div><div class="d-flex"><div class="flex-grow-1"> <svg xmlns="http://www.w3.org/2000/svg" width="22" height="21.999" viewBox="0 0 22 21.999" class="mr-1"><g transform="translate(-13710 408)"><g transform="translate(13714 -404)"><g transform="translate(2.249)"><g transform="translate(0)"><path d="M84.743,0a4.751,4.751,0,1,0,4.751,4.751A4.751,4.751,0,0,0,84.743,0Zm2.5,4.079L86.42,5.107l.09,1.343a.43.43,0,0,1-.181.381.435.435,0,0,1-.25.08.423.423,0,0,1-.168-.035l-1.166-.495-1.165.5a.432.432,0,0,1-.6-.426l.09-1.343-.821-1.028a.432.432,0,0,1,.228-.688l1.224-.32.672-1.132a.448.448,0,0,1,.742,0l.672,1.132,1.226.32a.433.433,0,0,1,.229.688Z" transform="translate(-79.992)" class="svg-fill-secondary-icon" /></g></g><g transform="translate(0 7.732)"><path d="M2.054,279.776.06,283.238a.432.432,0,0,0,.486.633l2.536-.682.675,2.536a.433.433,0,0,0,.359.317l.057,0a.432.432,0,0,0,.374-.216l1.886-3.264a5.617,5.617,0,0,1-4.379-2.79Z" transform="translate(-0.003 -279.776)" class="svg-fill-secondary-icon" /></g><g transform="translate(7.569 7.733)"><g transform="translate(0 0)"><path d="M280.095,283.239l-1.995-3.461a5.615,5.615,0,0,1-4.38,2.789l1.886,3.264a.432.432,0,0,0,.374.216.4.4,0,0,0,.055,0,.434.434,0,0,0,.361-.316l.675-2.536,2.536.682a.432.432,0,0,0,.487-.632Z" transform="translate(-273.72 -279.778)" class="svg-fill-secondary-icon" /></g></g></g><g transform="translate(13710.479 -408)"><g transform="translate(-0.478 0)"><path d="M18.483,3.106a11.067,11.067,0,0,0-15.377,0,11.066,11.066,0,1,0,15.65,15.651,11.067,11.067,0,0,0-.273-15.651Zm-.248,15.129h0a10.329,10.329,0,1,1,3.025-7.3,10.329,10.329,0,0,1-3.025,7.3Z" transform="translate(0.137 0)" class="svg-fill-secondary-icon" /></g></g></g></svg> $[{designationid.title}]</div> <div class="text-danger">$[{status}]</div></div></div>';
  dataContent: any;

  isLoadingData: boolean = true;
  itemVisbility: boolean = true;
  disableBtn: boolean = false;
  freezeAction: string;

  tabPermission: any[] = [];
  functionPermission: any[] = [];

  isLoadingPU: boolean = false;
  displayWlt: boolean = false;

  allData :  any;
  mydriveData : any;

  stallmentAmount: number;
  netAmount: number;
  taxAmount: number;
  stmlDate: Date;
  note: string;
  stallementtxt: string
  defaultWalletPage: boolean = false;

  sendMessageVisibility: boolean = false;
  emplymentStatusVisibility: boolean = false;
  
  displayedColumns : string[] = [ 'select', 'name', 'size', 'createdAt', 'addedby'];
  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort = {} as MatSort;

  contentVisibility: boolean = false;

  profileVisibility: boolean = true;
  timelineVisibility: boolean = false;
  communicationVisibility: boolean = false;
  walletVisibility: boolean = false;
  activitylogVisibility: boolean = false;

  actionselected: any;

  constructor(
    private _route: ActivatedRoute,
    private _usersService: UsersService,
  ) {
    super();
    this.pagename = "app-user-detail";

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.itemVisbility = false;
      this._formId = params["formid"] ? params["formid"] : "603c86a1c49da52f300bc3cc";
      this.contentVisibility = false;
    });

  }

  async ngOnInit() {

    this._route.params.forEach(async (params) => {
      this.isLoadingData = true;
      try {
        await super.ngOnInit();
        await this.initializeVariables()
        await this.loadData();
        
      } catch (error) {
        console.error(error)
      } finally {
        this.isLoadingData = false;
        if(this.defaultWalletPage == true) {
          this.walletClick();
        }
      }
    });
  }

  async initializeVariables() {
    this.dataContent = {};
    this.contentVisibility = false;
    
    this.profileVisibility = false;
    this.timelineVisibility = false;
    this.communicationVisibility = false;
    this.activitylogVisibility = false;
    this.walletVisibility = false;
    this.sendMessageVisibility = false;
    this.emplymentStatusVisibility = false;
    this.actionselected = "user";
    
    return;
  }

  async loadData() {
    this.tabPermission = [];
    this.profileVisibility = true;

    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var paymentObj = this._loginUserRole.permissions.find(p => p.formname == this._formName)
      if (paymentObj && paymentObj.tabpermission) {
        this.tabPermission = paymentObj.tabpermission;
      }
      var permissionObj = this._loginUserRole.permissions.find(p => p.formname == this._formName)
      if (permissionObj && permissionObj.functionpermission) {
        this.functionPermission = permissionObj.functionpermission;
      }
    }
    this.displayWlt = false;
    if (this._loginUserBranch && this._loginUserBranch.iswalletenable && this._loginUserBranch.iswalletenable == true) {
      this.displayWlt = true;
    }
    await this.getMembership();
  }


  async getMembership() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });

    var data = await this._usersService.AsyncGetByViewfilter(postData) as any;
    this.dataContent = data[0];//user data

    this.contentVisibility = true;
    this.itemVisbility = true;

    this.profileVisibility = true;
    this.timelineVisibility = false;
    this.communicationVisibility = false;
    this.activitylogVisibility = false;
    
    this.stallementtxt = null;
    this.disableBtn = false;
    if(this.dataContent){
      this.dataContent.balance = this.dataContent.wallet && this.dataContent.wallet.balance ? this.dataContent.wallet.balance : 0;
      
      if(!this.dataContent.property.bankname || !this.dataContent.property.accountnumber || !this.dataContent.property.ifsccode){
        this.stallementtxt = "Your setup is not complete, please contact support !!"
        this.disableBtn = true;
      }
    }
  }

  buttonToggle(type: string) {
    if (type == "user") {
      this.profileVisibility = true;
      this.timelineVisibility = false;
      this.communicationVisibility = false;
      this.walletVisibility = false;
      this.activitylogVisibility = false;
    } else if (type == "timeline") {
      this.profileVisibility = false;
      this.timelineVisibility = true;
      this.communicationVisibility = false;
      this.walletVisibility = false;
      this.activitylogVisibility = false;
    } else if (type == "communication") {
      this.profileVisibility = false;
      this.timelineVisibility = false;
      this.communicationVisibility = true;
      this.walletVisibility = false;
      this.activitylogVisibility = false;
    } else if (type == "activitylog") {
      this.profileVisibility = false;
      this.timelineVisibility = false;
      this.communicationVisibility = false;
      this.activitylogVisibility = true;
    }
  }

  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }

  getUpdated(submittedData: any) {
    if (submittedData) {
      this.ngOnInit();
    }
  }

  async getAvailabilityConfigurationData(submitData: any) {
    this.ngOnInit();
  }

  freezeUnfreezeClick(action:any)
  {
  this.freezeAction = action;
  console.log(this.freezeAction)
  this.suspendProfile(this.freezeAction)
  }

  suspendProfile(value:any) {
    const varTemp = this;
     if(value == 'suspend')
    { 
    swal.fire({
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      title: 'Are you sure want to Suspend profile ?',
      text: 'You will not be able to recover this!!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Suspend it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        let method = "PATCH";
        let url = "users/" + varTemp.dataContent._id;
        let postData = {};

        postData["property"] = {};
        postData["property"] = this.dataContent.property;
        postData["property"]["suspension_reason"] = result.value;
        postData["status"] = "suspend";

         return varTemp._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then(data => {
            if (data) {
              varTemp.showNotification('top', 'right', `Profile has been suspend successfully!!!`, 'success');
              varTemp._router.navigate(['/pages/dynamic-list/list/' + varTemp._formName]);
              return;
            }
          }, (error) => {
            console.error(error);
          }) 
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your Profile is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
    }
  
   else
  {
    let method = "PATCH";
    let url = "users/" + varTemp.dataContent._id;
    let postData = {};

    postData["property"] = {};
    postData["property"] = this.dataContent.property;    
    postData["property"]["suspension_reason"] = '';
    postData["status"] = "active";


    console.log(postData)
     return varTemp._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          varTemp.showNotification('top', 'right', `Profile has been active successfully!!!`, 'success');
          varTemp._router.navigate(['/pages/dynamic-list/list/' + varTemp._formName]);
          return;
        }
      })
  } 

  }  

  async onsaveStlm() {
    if (!this.dataContent.property.bankname || !this.dataContent.property.accountnumber || !this.dataContent.property.ifsccode ||  !this.stmlDate) {
      super.showNotification("top", "right", "Bank detail is not availble !!", "danger");
      return;
    }
    var balance = this.dataContent.balance;
    if (!balance || !this.stallmentAmount || this.stallmentAmount > balance) {
      super.showNotification("top", "right", "Stallment amount not valid  !!", "danger");
      return;
    }
    let api = "formdatas/";
    let method = "POST";

    let model = {};
    model['formid'] = "60b78be599e17f765884f532";
    model['contextid'] = this.bindId;
    model['onModel'] = "User";
    model['property'] = {};
    model['property']['bankname'] = this.dataContent.property.bankname;
    model['property']['accountno'] = this.dataContent.property.accountnumber;
    model['property']['ifscode'] = this.dataContent.property.ifsccode;
    model['property']['date'] = this.stmlDate;
    model['property']['note'] = this.note;
    model['property']['amount'] = this.stallmentAmount;
    model['property']['tax'] = this.taxAmount;
    model['property']['netAmount'] = this.netAmount;

    this.disableBtn = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(api, method, model)
      .then(async (data: any) => {
        if (data && data._id) {

          let wapi = "wallettxns/";
          let wmethod = "POST";

          let wmodel = {};
          wmodel['customerid'] = this.bindId;
          wmodel['onModel'] = "User";
          wmodel['value'] = this.stallmentAmount;
          wmodel['txndate'] = this.stmlDate;
          wmodel['txntype'] = "Dr";
          wmodel['txnref'] = this.note;

          wmodel['property'] = {};
          wmodel['property']['refid'] = data._id;

          console.log("wmodel", wmodel);

          await this._commonService
            .commonServiceByUrlMethodDataAsync(wapi, wmethod, wmodel)
            .then((wdata: any) => {
              console.log("wdata", wdata);
              super.showNotification("top", "right", "Stallment is done  !!", "success");
              this.disableBtn = true;
              $('#stlClose').click();
              this.getMembership();
            }).catch((e) => {
              super.showNotification("top", "right", "Something went wrong  !!", "danger");
              this.disableBtn = false;
              $('#stlClose').click();
            });
        }
      }).catch((e) => {
        super.showNotification("top", "right", "Something went wrong  !!", "danger");
        this.disableBtn = false;
        $('#stlClose').click();
      });
  }


 async getMydrive(){ 
  var url = "documents/filter/view";
  var method = "POST";

  let postData = {};
  postData['search'] = [];
  postData["search"].push({"searchfield": "userid", "searchvalue": this._loginUserId, "datatype": "ObjectId",  "criteria": "eq"});

  this.isLoadingPU = true;

   await this._commonService
    .commonServiceByUrlMethodDataAsync(url, method, postData)
    .then((data: any) => {
      if(data && data.length > 0) {
        // console.log("data=>",data)
          this.isLoadingPU = false;
          
          this.allData = data[0];
          this.mydriveData = data[0]["mydrive"];
        }
      }).catch((error) =>{
        console.error(error);
      });
    await this.setData();
  }


  getAttachmentPath(extension: any) {
    switch (extension) {
      case "ppt":
        return "../../../../../assets/img/dg-ppt-icon.svg";
      case "xls":
        return "../../../../../assets/img/dg-excel-icon.svg";
      case "doc":
        return "../../../../../assets/img/dg-doc-icon.svg";
      case "docx":
        return "../../../../../assets/img/dg-doc-icon.svg";
      case "pdf":
        return "../../../../../assets/img/dg-pdf-icon.svg";
      case "txt":
        return "../../../../../assets/img/dg-text-icon.svg";
      case "folder":
        return "../../../../../assets/img/dg-folder-icon.svg";
      default:
        return "../../../../../assets/img/image_placeholder.jpg";
    }
  }
   
  async setData() {
    this.ELEMENT_DATA = [];
    if (this.mydriveData && this.mydriveData.length > 0) {
      this.mydriveData.forEach(element => {
        element.sizeType = "---"
        if (element.size) {
          element.sizeType = this.formatBytes(element.size)
        }
        let obj = {
              checked: element.shared && element.shared.length > 0 ? element.shared.includes(this.bindId) : false,
              createdAt: element.createdAt,
              addedby: element.addedby,
              _id: element._id,
              name: element.title,
              path: element.path,
              shared: element.shared,
              sizeType: element.sizeType,
              type: element.path.substr(element.path.lastIndexOf('.') + 1)
            }
        this.ELEMENT_DATA.push(obj);
      });
    }
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

 async saveShared(){
    
    var url = "documents";
    var method = "PATCH";
    this.disableBtn = true;
    this.ELEMENT_DATA.forEach(async (doc , ind) => {
      if(!doc.shared){
        doc.shared = [];
      }
      if (doc.checked) {
        var fnd = doc.shared.find((a) => a == this.bindId);
        if (!fnd) {
          doc.shared.push(this.bindId);
        }
      } else {
        var fnd = doc.shared.find((a) => a == this.bindId);
        if (fnd) {
          var i = doc.shared.findIndex((i) => i == this.bindId);
          doc.shared.splice(i, 1);
        }
      }

      let postData = {};
      postData["shared"] = [];
      postData["shared"] = doc.shared;
      console.log("postData",postData);
      await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData ,doc._id)
        .then((data: any) => {
          console.log("data",data);
        })
        .catch((error) => {
          console.error(error);
        });
        if(ind+1 == this.ELEMENT_DATA.length){
          this.disableBtn = false;
          super.showNotification("top", "right", "Updated Successfully  !!", "success");
          $("#docClose").click();
        }
    });
    

  
    
  }

  getSubmittedIssueCardData(submitData: any) {
    this.defaultWalletPage = true;
    this.ngOnInit();
  }

   walletClick() {
    this.actionselected = undefined;
    this.profileVisibility = false;
    this.timelineVisibility = false;
    this.communicationVisibility = false;
    this.activitylogVisibility = false;
    this.walletVisibility = true;
    this.defaultWalletPage = false;


  }

  valueChanged(value){
    this.netAmount = this.stallmentAmount - value
  }

  async sendMessage() {
    this.sendMessageVisibility = true;
  }

  async emplymentStatus() {
    this.emplymentStatusVisibility = true;
  }
  
  getSubmittedCloseMessageData(submitData: any) {
    $("#closeform").click();
  }

  getSubmittedCloseEmplymentStatusData(submitData: any) {
    $("#closeemploymentstatusform").click();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  onCloseResendData(submitData: any) {
    this.ngOnInit();
    setTimeout(() => {
      this.buttonToggle('communication')  
      this.actionselected = "communication"
    }, 1000);
  }

}

@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) { }
  transform(v: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(v);
  }
}
