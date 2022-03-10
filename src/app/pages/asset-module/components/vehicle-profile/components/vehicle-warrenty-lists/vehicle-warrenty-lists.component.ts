import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import swal from 'sweetalert2';
import { CommonService } from '../../../../../../core/services/common/common.service';


declare var $: any;

@Component({
  selector: 'app-vehicle-warrenty-lists',
  templateUrl: './vehicle-warrenty-lists.component.html',
})

export class VehicleWarrentyListsComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;
  @Output() onWarrentyData = new EventEmitter();

  displayedColumns3: string[];
  dataSource3: any[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new MatTableDataSource<Element>();

  form: FormGroup;
  submitted: boolean;
  disableBtn: boolean = false;

  filteredPartsMaterialOptions: Observable<string[]>;
  filteredVendorOptions: Observable<string[]>;

  allpartsmaterialLists: any[] = [];
  allVendorLists: any[] = [];

  partsmaterialisLoadingBox: boolean = false;
  vendorLoadingBox: boolean = false;

  materialsLists: any[] = [];
  vendorsLists: any[] = [];

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
  ) {
    super()

    this.pagename = "app-vehicle-warrenty-lists";

    this.form = fb.group({
      '_id': [],
      'dateofpurchase': ['', Validators.required],
      'expirydate': ['', Validators.required],
      'partsmaterialid': ['', Validators.required],
      'vendorid': ['', Validators.required],
      'warrantyno': ['', Validators.required],
    });
  }

  async ngOnInit() {

    try {
      await super.ngOnInit();
      await this.loadWarrentyLists()
      await this.initializeVariables()
      await this.getWarrentyData()
      await this.getVendorData()

    } catch (error) {
      console.error(error);
    } finally {

      this.filteredPartsMaterialOptions = this.form.get('partsmaterialid').valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : ''),
          map(option => option ? this._partsmaterialfilter(option) : this.allpartsmaterialLists.slice())
        );

      this.filteredVendorOptions = this.form.get('vendorid').valueChanges
        .pipe(
          startWith(''),
          map(option => typeof option === 'string' ? option : ''),
          map(option => option ? this._venodrfilter(option) : this.allVendorLists.slice())
        );

    }
  }

  async initializeVariables() {

    this.displayedColumns3 = [];
    this.displayedColumns3 = ['partsmaterial', 'vendor', 'warrantyno', 'dateofpurchase', 'expirydate', 'action'];
    this.dataSource3 = [];

  }

  async loadWarrentyLists() {

    if (this.dataContent && this.dataContent.warranty && this.dataContent.warranty.length > 0) {

      this.dataContent.warranty.forEach(element => {
        this.dataSource3.push({
          partsmaterial: element.partsandmaterial && element.partsandmaterial[0].itemname ? element.partsandmaterial[0].itemname : '---',
          vendor: element.vendor && element.vendor.fullname ? element.vendor.fullname : '---',
          dateofpurchase: element.property && element.property.dateofpurchase ? element.property.dateofpurchase : '---',
          warrantyno: element.property && element.property.warrantyno ? element.property.warrantyno : '---',
          expirydate: element.property && element.property.expirydate ? element.property.expirydate : '---',
          _id: element._id,
        });
      });


      this.dataSource = new MatTableDataSource<Element>(this.dataSource3);
      this.dataSource.paginator = this.paginator;
    }
    return;
  }


  async getWarrentyData() {
    var url = "billitems/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          this.materialsLists = [];
          this.materialsLists = data;
          this.allpartsmaterialLists = data;

          return;

        }
      }, (error) => {
        console.error(error);
      });

  }

  displayPartsMaterialFn(user: any): string {
    return user && user.itemname ? user.itemname : '';
  }

  private _partsmaterialfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.allpartsmaterialLists
        .filter(option => {
          if (option.itemname) {
            return option.itemname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.allpartsmaterialLists.slice();
    }
    return results;
  }


  async getVendorData() {

    var url = "vendors/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          this.vendorsLists = [];
          this.vendorsLists = data;
          this.allVendorLists = data;
          return;
        }
      }, (error) => {
        console.error(error);
      });

  }

  displayVendorFn(user: any): string {
    return user && user.fullname ? user.fullname : '';
  }

  private _venodrfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.allVendorLists
        .filter(option => {
          if (option.fullname) {
            return option.fullname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.allVendorLists.slice();
    }
    return results;
  }


  warrentyEdit(element: any) {

    this.form.controls['_id'].setValue(element._id);
    this.form.controls['partsmaterialid'].setValue(this.allpartsmaterialLists.find(a => a.itemname == element.partsmaterial));
    this.form.controls['vendorid'].setValue(this.vendorsLists.find(a => a.fullname == element.vendor));
    this.form.controls['warrantyno'].setValue(element.warrantyno);
    this.form.controls['dateofpurchase'].setValue(new Date(element.dateofpurchase));
    this.form.controls['expirydate'].setValue(new Date(element.expirydate));
    $("#myModalVehicles").click();

  }

  warrentyDelete(element: any, type: any) {

    swal.fire({
      title: 'Are you sure to Delete?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {


        var url = "formdatas/"
        var method = "DELETE";

        this.disableBtn = true;

        if (element._id) {
          this._commonService
            .commonServiceByUrlMethodIdOrData(url, method, element._id)
            .subscribe((data: any) => {
              if (data) {
                this.disableBtn = false;
                this.showNotification('top', 'right', 'Appointment has been deleted successfully', 'success');
                $("#closeWarrentyAsset").click();
                this.form.reset();
                this.ngOnInit();

                setTimeout(() => {
                  this.onWarrentyData.emit("success");
                }, 1000);

              }
            }, (error) => {
              this.disableBtn = false;
              console.error(error);
            });
        }
      }
    });
  }

  onSubmit(value: any, isValid: boolean) {

    this.submitted = true;

    if (!isValid) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return false;
    } else {

      let postData = {};
      postData["onModel"] = "Asset";
      postData["onModelAddedby"] = "User";
      postData["formid"] = "61bc68dac908ab0ff8144bde";
      postData["contextid"] = this.dataContent._id;
      postData["property"] = {};
      postData["property"]["partsandmaterial"] = value.partsmaterialid._id ? value.partsmaterialid._id : value.partsmaterialid.value;
      postData["property"]["vendor"] = value.vendorid._id ? value.vendorid._id : value.vendorid.value;
      postData["property"]["warrantyno"] = value.warrantyno;
      postData["property"]["dateofpurchase"] = new Date(value.dateofpurchase);
      postData["property"]["expirydate"] = new Date(value.expirydate);
      postData["property"]["description"] = "";
      postData["property"]["attachment"] = [];

      var url = "formdatas"
      var method = "POST";

      this.disableBtn = true;

      if (value._id) {
        method = "PUT"
        this._commonService
          .commonServiceByUrlMethodData(url, method, postData, value._id)
          .subscribe((data: any) => {
            if (data) {
              this.disableBtn = false;
              this.showNotification('top', 'right', 'Warrenty has been updated successfully', 'success');
              $("#closeWarrentyAsset").click();
              this.form.reset();
              this.ngOnInit();

              setTimeout(() => {
                this.onWarrentyData.emit("success");
              }, 1000);

            }
          }, (error) => {
            this.disableBtn = false;
            console.error(error);
          });

      } else {

        var url = "formdatas"
        var method = "POST";

        this.disableBtn = true;
        this._commonService
          .commonServiceByUrlMethodData(url, method, postData)
          .subscribe((data: any) => {
            if (data) {
              this.disableBtn = false;
              this.showNotification('top', 'right', 'Warrenty has been added successfully', 'success');
              $("#closeWarrentyAsset").click();
              this.form.reset();
              this.ngOnInit();

              setTimeout(() => {
                this.onWarrentyData.emit("success");
              }, 1000);

            }
          }, (error) => {
            this.disableBtn = false;
            console.error(error);
          });
      }

    }
  }
}
