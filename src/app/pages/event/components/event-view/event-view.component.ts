import { Component,  OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-event-view',
  templateUrl: './event-view.component.html'
})
export class EventViewComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
   
  dataContent: any = {};
  reloadingStr : string;

  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  tabPermission: any[] = [];
  functionPermission : any[] = [];

  isOpen : boolean = false;
   
  constructor(
    private _route: ActivatedRoute, 
   
  ) {
    super();
 

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      if(params["fid"]){
        this._formId = params["fid"];
      }else{
        this._formName = "event";
      }
    });
  }
 
  async ngOnInit() {
    this._route.params.forEach(async (params) => {
      await super.ngOnInit();
      try {
        this.tabPermission = [];
        if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
          var paymentObj = this._loginUserRole.permissions.find(p => p.formname == this._formName)
          if (paymentObj && paymentObj.tabpermission) {
            this.tabPermission = paymentObj.tabpermission;
          }
        }
        this.contentVisibility = false;
        this.itemVisbility = false;
        await this.LoadData();
        this.contentVisibility = true;
        this.itemVisbility = true;
      } catch (err) {
        console.error(err);
      } finally {
        
      }
    });
  }

async LoadData(){
       
    let method = "POST";
    let url = "events/filter/view";
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });
 
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          this.dataContent = data[0];
        }
      }, (error) => {
        console.error(error);
      });
  }

  getSubmittedData(event : any , str : string){
    if(event){
      this.reloadingStr = str;
      this.LoadData();
    }
  }
  
 async getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) {
      this.bindId = submitData.bindData._id;
      this.contentVisibility = false;
      await this.LoadData();
      this.contentVisibility = true;
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


 async getSubmitted(event : any, str : string) {
    if(event){
      this.reloadingStr = str;
      await this.LoadData();
      setTimeout(() => { 
        this.isOpen = !this.isOpen;
      }, 200);
    }
  }
}