import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { ModalListComponent } from 'src/app/shared/modal-list/modal-list.component';
import { CommonService } from '../../../../core/services/common/common.service';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-appointment-view',
  templateUrl: './appointment-view.component.html',
})

export class AppointmentViewComponent extends BaseComponemntComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();
  bindId : any;
  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  postData : any;
  headers : any[] = [];
  dataContent : any;

  visible : boolean = false;

  @ViewChild('modalbox', { static: false }) modalList : ModalListComponent;

  constructor(
    private _route: ActivatedRoute
  ) {
    super();
  
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formId = params["formid"] ? params["formid"] : "5dce5bfe78ce122230e0ec4d";
      this.pagename = 'appointmentbooking-view';
      this.contentVisibility = false;
      this.itemVisbility = false;
    });
  }
        
  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();
  }

  async LoadData() {
    this.postData = {};
    this.postData["search"] = [];
    this.postData["search"].push({ "searchfield": "objectid", "searchvalue": this.bindId, "criteria":"eq" , "datatype" : "ObjectId" });
    this.postData["search"].push({ "searchfield": "schemaname", "searchvalue": 'appointments', "criteria":"eq" , "datatype" : "text" });
    
    this.postData["sort"] = { "date": -1 };
    
    this.headers = [];
    this.headers = [
      { 'fieldname': "date", 'displayname': "Date" }, 
      { 'fieldname': "objecttype", 'displayname': "Object" }, 
      { 'fieldname': "log", 'displayname': "Log Entry" }, 
      { 'fieldname': "description", 'displayname': "Description" }, 
      { 'fieldname': "updatedby", 'displayname': "User" }, 
    ]
    if (this.bindId) {
      await this.getDetailByid(this.bindId);
    }
  }

 async getDetailByid(id : any){
    
  let method = "POST";
  let url = "appointments/filter";

  let postData =  {};
  postData["search"] = [];
  postData["search"].push({ "searchfield": "_id", "searchvalue": id, "criteria":"eq" , "datatype" : "ObjectId" });

  return this._commonService
    .commonServiceByUrlMethodDataAsync(url, method, postData)
    .then((data: any)=>{
      this.dataContent = data[0];
      this.contentVisibility = true;
      this.itemVisbility = true;
    });
  }

  onClick(){
    this.visible = true;
    setTimeout(() => {
      this.modalList.clickPP();
    });
  }
  onCancel(event : any){
    setTimeout(() => {
      this.visible = false;
    },500);
  }
       
  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}

