import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/core/services/common/common.service';
import { UserModel } from 'src/app/core/models/auth/user.model';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ButtonModel } from '../../../../../core/models/dynamic-lists/button.model';

import { FormsService } from '../../../../../core/services/forms/forms.service';

import swal from 'sweetalert2';

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
})
export class LeaveRequestComponent extends BaseComponemntComponent implements OnInit {
  @Input() bindId: any;
  @Input() dataContent: any;
  @Input() formObj:any;
  @Output() updateRecord = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource;
  filter = '';
  gridactionList: any[] = [];
  formList: any = {};
  formData:any;
  formListData:any;
  formlistaddbuttonurl: string;




  approveBtn: ButtonModel | null;
  denyBtn: ButtonModel | null;
  editBtn:ButtonModel | null;
  filterFieldListLoad = false;
  ELEMENT_DATA: any[] = [];
  displayedColumns: string[] = ['Fullname', 'Leavetype', 'FromDate', 'ToDate', 'Action'];


  constructor(
    public _route: ActivatedRoute,
    public _router: Router,
    public _formsService: FormsService,
  ) {

    super();
    this.pagename = "app-leave-request";
    this._route.params.forEach((params) => {
      this._formId = params["formid"];
      this.formlistname = params["formlisting"];
    })

  }

  async ngOnInit(){
    super.ngOnInit();
    this._route.params.forEach(async (params) => {
      try {
        this._formId = params["formid"];
        await super.ngOnInit();
        this.getleaveRequest();
        await this.getform()
        await this.getformlist();
        await this.getFormList();


      } catch (error) {
        console.error({ error });
      } finally {
      }
    })

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async getleaveRequest()
  {
    if (this.dataContent.leaverequests && this.dataContent.leaverequests.length > 0) {
      this.dataContent.leaverequests.forEach(ele => {
        let obj = {
          fullname: ele._id.userid.fullname ? ele._id.userid.fullname : '---',
          leavetype: ele._id.leavetype.title ? ele._id.leavetype.title : '---',
          fromdate: ele.property && ele.property.fromdate ? new Date(ele.property.fromdate).toLocaleString(this._commonService.currentLocale()) : '',
          todate: ele.property && ele.property.todate ? new Date(ele.property.todate).toLocaleString(this._commonService.currentLocale()) : '',
          status: ele.status ? ele.status : '---',
          _id: ele._id
        }
        this.ELEMENT_DATA.push(obj);
      });

    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
    this.dataSource.sort = this.sort;
    return;
    }
  }

  protected onClickbutton(element: any, rowobj: any) {
    swal.fire({
      title: 'Are you sure?',
     // text: 'You will not be able to revert this document !!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Confirm it!',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        var id = rowobj._id;
        this.updatewfstatus(element, id._id)
      }
    })

  }

  reloadList(filter = '') {
    if (filter) this.filter = filter;
    else this.filter = '';
    this.approveBtn.isShow = true
    this.denyBtn.isShow = true
    if (filter == "approve"){
      this.approveBtn.isShow = false
    }
    if (filter == "decline"){
      this.denyBtn.isShow = false
    }
    this.getleaveRequest();
    this.filterFieldListLoad = false;
  }

  actionlistRecord(id: any, obj: any) {
    this._router.navigate(['/pages/dynamic-forms/form/' + '5f572d15d0835e16a8371e16' + '/' + id._id._id]);
  }

    async getFormList() {
    this.isLoading = true;
    this.filterFieldListLoad = false;
    console.log(this.formListData);

    if (this.formListData.addbuttonurl) {
      var url = this.formList.addbuttonurl.replace(':_formid',this._formId);
      this.formlistaddbuttonurl = url;
    }

    if (this.formListData && this.formListData['gridaction'] && this.formListData['gridaction'].length !== 0) {
      this.gridactionList = [];
      this.clearActionBtn();
      this.gridactionList = this.formListData.gridaction;
      this.gridActionLists()
    }
    this.isLoading = false;
  }

  gridActionLists() {
    this.gridactionList.forEach(ele => {
      if (ele.action == 'edit') {
        this.editBtn.isShow = true;
        this.editBtn.url = ele.url;
        this.editBtn.actionurl = ele.actionurl;
        this.editBtn.propertObj = ele;
        this.editBtn.action = ele.action;
        this.editBtn.color = ele.color;
        this.editBtn.title = ele.title;
      }
    });
    this.approveBtn.isShow = true;
    this.approveBtn.title = "Approved";
    this.denyBtn.isShow = true;
    this.denyBtn.title = "Declined";
  }

  async updatewfstatus(data: any, id: any) {

    let postData = {};
    let url = "common/massupdate";
    let method = "POST";

    postData["schemaname"] = "leaverequests";
    postData["ids"] = [id];
    postData["fieldname"] = "wfstatus";
    postData["fieldvalue"] = data;
    postData["datatype"] = "text";

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe(data => {
        if (data) {
          this.showNotification('top', 'right', 'leave request update has been done successfully!!!', 'success');
          this.updateRecord.emit(data);
        }
      }, (err) => {

      })

  }

  async clearActionBtn() {
    this.editBtn= {} as any;
    this.approveBtn= {} as any;
    this.denyBtn= {} as any;
    return;
  }

  async getform() {
    
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this._formId, "criteria": "eq" });

    return this._formsService
      .GetByfilterAsync(postData)
      .then((data: any) => {
        if (data) {
          this.formData = data;
      }
      let eleform = this.formData;

      if (eleform.addbuttonurl) {
        var url = eleform.addbuttonurl.replace(':_formid', this._formId);
        this.formlistaddbuttonurl = url;
      } else {
        this.formlistaddbuttonurl = "/pages/dynamic-forms/form/" + this._formId;
      }
    })
  }

    async getformlist(){
    var url = "formlists/filter" ;
    var method = "POST";
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "formname", "searchvalue":this.formData[0].formname , "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.formListData = data[0];
        }
        if (this.formListData.addbuttonurl) {
          var url = this.formListData.addbuttonurl.replace(':_formid',this._formId);
          this.formlistaddbuttonurl = url;
        }
        if (this.formListData && this.formListData['gridaction'] && this.formListData['gridaction'].length !== 0) {
          this.gridactionList = [];
          this.clearActionBtn();
          this.gridactionList = this.formListData.gridaction;
          this.gridActionLists()
        }
       })
    }



   applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
