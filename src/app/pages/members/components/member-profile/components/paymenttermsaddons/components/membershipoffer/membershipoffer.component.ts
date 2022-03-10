import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-membershipoffer',
  templateUrl: './membershipoffer.component.html'
})
export class MembershipOfferComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;
  @Input() bindId: any;

  membershipOfferList: any[] = [];
  memberOfferList : any[] = [];

  isLoading : boolean = false;
  btnDisable: boolean = false;

  constructor(
    private _commonService : CommonService,
  ) {
    super()
    this.pagename = "app-membershipoffer";
  }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      this.isLoading = true;
      await this.getMembershipoffers(); 
      this.isLoading = false;
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  addOffer(item : any) {
    
    let obj = item;
    obj['isedit'] = true;
    obj['contextid'] = item.contextid && item.contextid._id ? item.contextid._id : null; 
    obj['property']['cost'] = 0;
    obj['property']['quantity'] = 0;
    obj['property']['date'] = new Date();
    obj['property']['expirydate'] = new Date();
    obj['property']['consumed'] = false;
    this.memberOfferList.push(obj);
  }
 
 async getMembershipoffers(){
 
    let url = "formdatas/filter";
    let method = "POST";
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "formid", "searchvalue": "60deb6f4761d7a1cbf5df0e8", "datatype": "ObjectId", "criteria": "eq" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "datatype": "text", "criteria": "eq" });
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data : any[]) => {
        this.membershipOfferList = [];
        this.memberOfferList = [];
        data.forEach(ele => {
          if(!ele.contextid){
            this.membershipOfferList.push(ele);
          }else if(ele.contextid && ele.contextid._id && ele.contextid._id == this.bindId){
            this.memberOfferList.push(ele);
          }else{}
        });
      });
  }

 async updatePayTerms(item : any){
    var model = item;
    let method = "POST";
    let contextid = model.contextid && model.contextid._id ? model.contextid._id : model.contextid;
    let id;

    if(contextid && contextid == this.bindId){
      method = "PUT";
      id = model._id;
    }else{
      model['contextid'] = this.bindId;
      model['onModel'] = "Member";
    }
    model['formid'] = item['formid']['_id'];
   
    let url = "formdatas";
 
    this.btnDisable = true;
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, id)
      .then((data : any) => {
        
        this.btnDisable = false;
        super.showNotification("top", "right", "Offer updated successfully !!", "success");
        this.ngOnInit();
      }).catch((e)=>{
        console.log("e",e);
        super.showNotification("top", "right", "Something went wrong !!", "danger");
        this.btnDisable = false;
      });
  }
  
  async delete(item : any) {
    var itemid = item._id;
    if(item && item.contextid && item.contextid._id){
    let url = "formdatas/";
    let method = "DELETE";
  
    this.btnDisable = true;
    return this._commonService
      .commonServiceByUrlMethodIdOrDataAsync(url, method, itemid)
      .then((data : any) => {
        this.btnDisable = false;
        super.showNotification("top", "right", "Offer deleted successfully !!", "success");
        this.ngOnInit();
      }).catch((e)=>{
        console.log("e",e);
        super.showNotification("top", "right", "Something went wrong !!", "danger");
        this.btnDisable = false;
      });
    } else {
      this.memberOfferList.splice(this.memberOfferList.findIndex(a=>a._id == itemid),1);
    }
  }

}
