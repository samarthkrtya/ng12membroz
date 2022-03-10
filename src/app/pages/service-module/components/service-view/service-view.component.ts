import { AfterContentInit, Component, OnDestroy, OnInit, OnChanges } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, of, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { BaseComponemntComponent } from "src/app/shared/base-componemnt/base-componemnt.component";

@Component({
  selector: "app-service-view",
  templateUrl: "./service-view.component.html",
})
export class ServiceViewComponent extends BaseComponemntComponent implements OnInit, OnDestroy {

  subject = new Subject<number>();

  destroy$: Subject<boolean> = new Subject<boolean>();

  dataContent: any = {};
  tabPermission: any = []
  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  productList: any[] = [];
  assetList: any[] = [];
  assetRoomList: any[] = [];
  staffList: any[] = [];


  constructor(private _route: ActivatedRoute) {
    super();
    this._route.params.subscribe((params) => {
      this.bindId = params['id'];
      this._formId = params['formid'];
      this.contentVisibility = false;
      this.itemVisbility = false;
    });
  }

  async ngOnInit() {
    await super.ngOnInit();


    this._route.params.forEach(async (params) => {
      try {
        this.contentVisibility = false;
        this.itemVisbility = false;
        await this.initializeVariable();
        await this.LoadData();
        this.contentVisibility = true;
        this.itemVisbility = true;
      } catch (err) {
        console.error(err);
      }
    });
  }

  async initializeVariable() {
    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var paymentObj = this._loginUserRole.permissions.find(p => p.formname == this._formName)
      if (paymentObj && paymentObj.tabpermission) {
        this.tabPermission = paymentObj.tabpermission;

      }
    }
    return;
  }

  async LoadData() {

    let method = "POST";
    let url = "services/filter";
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {

          this.dataContent = data[0];
          if (this.dataContent.items && this.dataContent.items.length > 0) {
            this.productList = this.dataContent.items;
          }
          if (this.dataContent.assets && this.dataContent.assets.length > 0) {
            this.assetList = this.dataContent.assets;
          }
          if (this.dataContent.rooms && this.dataContent.rooms.length > 0) {
            this.assetRoomList = this.dataContent.rooms;
          }
          if (this.dataContent.supportstaff && this.dataContent.supportstaff.length > 0) {
            this.staffList = this.dataContent.supportstaff;
          }
        }

      }, (error) => {
        console.error(error);
      })
  }



  async getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.contentVisibility = false;
    await this.LoadData();
    this.contentVisibility = true;
  }

  async onSaveProduct(event: any) {
    if (event) await this.LoadData();
  }


  ngOnDestroy() {
    this.destroy$.next(false);
  }


}