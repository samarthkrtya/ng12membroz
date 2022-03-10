import { Pipe, PipeTransform } from '@angular/core';
import { CommonService } from 'src/app/core/services/common/common.service';

@Pipe({name: 'toLocaleDate'})
export class dateLocalePipe implements PipeTransform
{
    constructor(private _commonService: CommonService) {}
    
    transform(value : any , arg : string): any {
        if(arg && arg == 'time'){
            return new Date(value).toLocaleTimeString(this._commonService.currentLocale())
        }else if(arg && arg == 'datetime'){
            return new Date(value).toLocaleString(this._commonService.currentLocale())
        }else{
            return new Date(value).toLocaleDateString(this._commonService.currentLocale())
        }
    }
}