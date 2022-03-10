import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { CommonService } from '../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-dynamic-form-preview',
  templateUrl: './dynamic-form-preview.component.html',
  styles: [
  ]
})
export class DynamicFormPreviewComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() formid: any;
  @Output() onDynamicFormData = new EventEmitter();

  _sectionLists: any [] = [];

  isLoading: boolean = true;
  
  constructor(
    private _commonService: CommonService
  ) {
    super()
  }

  async ngOnInit() {
    
    this.isLoading = true;


    try {
      await super.ngOnInit()
      await this.initializeVariables()
      await this.LoadData()
      await this.getFormTypeDropdownValue();
    } catch(error) {
      console.log("error", error)
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this._sectionLists = [];
    this.isLoading = true;
    return;
  }

  async LoadData() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ searchfield: "formid", searchvalue: this.formid._id, criteria: "eq", "datatype": "ObjectId" });
    postData["sort"] = "formorder";

    var url = "formfields/filter";
    var method = "POST";

    console.log("postData", postData);

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        console.log("data", data);

        if (data && data.length > 0) {
          
          data.forEach((element) => {
            if (element.fieldtype == "slide_toggle" && !element.value) {
              element.value = false;
            }
          });

          this._sectionLists = [];
          this._sectionLists = this.groupBy(data, "sectionname");

          console.log("_sectionLists", this._sectionLists);
          
          if (this.formid && this.formid["rootfields"] && this.formid["rootfields"].length > 0) {
            this.formid["rootfields"].forEach((element) => {
              element["sectionname"] = this._sectionLists[0]["sectionname"];
              element["sectiondisplaytext"] = this._sectionLists[0]["sectiondisplaytext"];
              this._sectionLists[0].unshift(element);
            });
          }
          return;
        }
      }, (err) => {
        console.error("err", err);
      });
    
  }

  async getFormTypeDropdownValue() {

    this._sectionLists.forEach((eleMain) => {

      eleMain.forEach(element => {

        if ((element.fieldtype == "form_multiselect") || (element.fieldtype == "form" && element.multiselect)) {

          element.readonly = false;

          let postData = {};
          postData["search"] = [];
          if (element && element["form"] && element["form"]["fieldfilter"]) {
            let res = element["form"]["fieldfilter"].split(".");
            if (res[0]) {
              element["form"]["fieldfilter"] = res[0];
            }
            postData["search"].push({ searchfield: element["form"]["fieldfilter"], searchvalue: element["form"]["fieldfiltervalue"], criteria: element["form"]["criteria"] ? element["form"]["criteria"] : "eq" });
            postData["select"] = [];
            postData["select"].push({ fieldname: element["form"]["formfield"], value: 1 });
            postData["select"].push({ fieldname: element["form"]["displayvalue"], value: 1 });
            postData["sort"] = element["form"]["displayvalue"];
          }

          element.formfieldfilterValue = [];
          let url = element["form"]["apiurl"];
          let method = element["form"]["method"] ? element["form"]["method"] : "POST";

          this._commonService
            .commonServiceByUrlMethodData(url, method, postData)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
              if (data) {
                if (data.length !== 0) {
                  data.forEach((ele) => {
                    let val: any;
                    let displayvalue: any;
                    if (element["form"]["displayvalue"].indexOf(".") !== -1) {
                      let stringValue = element["form"]["displayvalue"].split(".");
                      let str1 = stringValue[0];
                      let str2 = stringValue[1];
                      val = ele[str1][str2];
                    } else {
                      displayvalue = element["form"]["displayvalue"];
                      val = ele[displayvalue];
                    }

                    let formfield = element["form"]["formfield"];
                    let key = ele[formfield];
                    let obj = { id: key, itemName: val };
                    element.formfieldfilterValue.push(obj);

                  });
                }
              }
            }, (err) => {
              console.error("err", err);
            });
        } else if (element.fieldtype == "category_list") {

          let url = "formdatas/filter";
          let method = "POST";

          let postData = {};
          postData["search"] = [];
          postData["search"].push({ searchfield: "status", searchvalue: "active", criteria: "eq" });

          element.formfieldfilterValue = [];
          var test;
          this._commonService
            .commonServiceByUrlMethodData(url, method, postData)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: any) => {
              if (data) {
                if (data.length !== 0) {


                  data.forEach((ele) => {


                    let child_val: any;
                    let childvalue: any;
                    if (element["form"]["displayvalue"].indexOf(".") !== -1) {
                      let stringValue = element["form"]["displayvalue"].split(".");
                      let str1 = stringValue[0];
                      let str2 = stringValue[1];
                      child_val = ele[str1][str2];
                    } else {
                      childvalue = element["form"]["displayvalue"];
                      child_val = ele[childvalue];
                    }


                    let parent_val: any;
                    let parentvalue: any;
                    if (element["form"]["parentvalue"].indexOf(".") !== -1) {
                      let stringValue = element["form"]["parentvalue"].split(".");
                      let str1 = stringValue[0];
                      let str2 = stringValue[1];
                      parent_val = ele[str1][str2];
                    } else {
                      parentvalue = element["form"]["parentvalue"];
                      parent_val = ele[parentvalue];
                    }




                    if(ele && child_val && parent_val) {

                      var skillObj = element.formfieldfilterValue.find(p=>p.name == child_val);
                      if(skillObj) {
                        skillObj.pokemon.push({value: ele._id, viewValue: parent_val})
                      } else {
                        let obj = {
                          name: child_val,
                          pokemon: [
                            {value: ele._id, viewValue: parent_val}
                          ]
                        }
                        element.formfieldfilterValue.push(obj);
                      }
                    }


                  });

                }
              }
            }, (err) => {
              console.error("err", err);
            });

        }
      });
    });
    return;

  }

  groupBy(collection: any, property: any) {
    let i = 0, val, index, values = [], result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].push(collection[i]);
      } else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  }

}
