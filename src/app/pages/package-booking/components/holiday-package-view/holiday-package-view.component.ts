import { Component,  OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-holiday-package-view',
  templateUrl: './holiday-package-view.component.html'
})
export class HolidayPackageViewComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
   

  dataContent: any = {};

  contentVisibility: boolean = false;
  itemVisbility: boolean = false;
   
  constructor(
    private _route: ActivatedRoute, 
   
  ) {
    super();
 

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formName =  "tourpackage";
    });
  }
 
  async ngOnInit() {
    this._route.params.forEach(async (params) => {
      await super.ngOnInit();
      try {
        this.contentVisibility = false;
        this.itemVisbility = false;
        await this.LoadData();
      } catch (err) {
        console.error(err);
      } finally {
        
      }
    });
  }

async  LoadData(){
    
    this.contentVisibility = false;

    let method = "POST";
    let url = "tourpackages/filter";
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });


    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          this.dataContent = data[0]; 
          console.log("this.dataContent",this.dataContent);
          this.contentVisibility = true;
          this.itemVisbility = true; 
        }
      }, (error) => {
        console.error(error);
      })
  }
  

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }    
}