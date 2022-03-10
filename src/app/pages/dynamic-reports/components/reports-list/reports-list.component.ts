import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
    selector: 'app-reports-list',
    templateUrl: './reports-list.component.html'
})
export class ReportsListComponent extends BaseLiteComponemntComponent implements OnInit {

    isLoading: boolean = false;
    type: any;
    formname : string;

    reportList: any[] = [];
    reportgrpList: any[] = [];

    reportsgrpList: any[] = [];

    addPermission: boolean = false;
    editPermission: boolean = false;

    constructor(
        private _route: ActivatedRoute,
        private _commonService: CommonService,
        
    ) {
        super();
        this.isLoading = false;
    }

    async ngOnInit() {
        await super.ngOnInit();
        this._route.params.forEach((param: any) => {
            this.getAllReports();
        });
        this.addPermission = false;
        this.editPermission = false;
        // if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
        //     var fObj = this._loginUserRole.permissions.find(p => p.formname == this.formname)
        //     if (fObj && fObj.recordpermission && fObj.recordpermission.length > 0) {
        //         var aobj = fObj.recordpermission.find(p => p.type == "add")
        //         if (aobj) {
        //             this.addPermission = true;
        //         }
        //         var eobj = fObj.recordpermission.find(p => p.type == "edit")
        //         if (eobj) {
        //             this.editPermission = true;
        //         }
        //     }
        // }
    }

    async getAllReports(){

        let apiurl = 'reports/filter/all';
        let apimethod = 'POST';
        let listFilterParams = {};
    
        this.isLoading = true;
        
        await this._commonService
            .commonServiceByUrlMethodDataAsync(apiurl, apimethod, listFilterParams)
            .then((data: any) => {
                data.map((a)=>{
                    a.url = '/pages/dynamic-reports/report-view/'+ a.schemaname + '/'+ a._id;
                    a.isChartEnabled = a.selectfields.filter(b=>b.ishorizontal  ==  true).length > 0;
                });
                this.reportsgrpList = this.groupBy(data, 'category');
                this.isLoading = false;
            });
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
