import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-facility-detail',
  templateUrl: './facility-detail.component.html',
})
export class FacilityDetailComponent extends BaseComponemntComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataContent: any;
  isLoadingData: boolean = true;
  itemVisbility: boolean = true;
  disableBtn: boolean = false;

  tabPermission: any[] = [];

  constructor(
    private _route: ActivatedRoute,
  ) { 
    super();
    this.pagename = "app-facility-detail";

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.itemVisbility = false;
      this._formId = params["formid"] ? params["formid"] : "607d5676dc539117484cda1c";
    });
  }

  async ngOnInit(){
    this._route.params.forEach(async (params) => {
      this.isLoadingData = true;
      try {
        await super.ngOnInit();
        await this.loadData();
      } catch (error) {
        console.error(error)
      } finally {
        this.isLoadingData = false;
      }
    });
  }

  async loadData() {
    this.tabPermission = [];
    console.log(this._formName);    
    
    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var paymentObj = this._loginUserRole.permissions.find(p => p.formname == this._formName)
      if (paymentObj && paymentObj.tabpermission) {
        this.tabPermission = paymentObj.tabpermission;
        
      }
    }
    await this.getAssets();
  }

  async getAssets() {
    console.log(this.bindId);
    
    var url = "assets/view/filter";
    var method = "POST";
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq","datatype": "ObjectId" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.dataContent = data[0];
          console.log("this.dataContent", this.dataContent);
          this.itemVisbility = true;
        }
      })
      
  }
 

  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }

  getUpdatedownership(submittedData: any) {
    if (submittedData) {
      this.ngOnInit();
    }
  }

  getUpdatedmaintanance(submittedData: any) {
    if (submittedData) {
      this.ngOnInit();
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
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
