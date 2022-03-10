import { Component, Input, EventEmitter, Output } from '@angular/core'; 
import { ISalesDesignation } from '../../sales-channel-hierarchy.component';


@Component({
	selector: 'ng-saleschannel-chart',
	templateUrl: './saleschannel-chart.component.html',
	styleUrls: ['./saleschannel-chart.component.css']
})
export class SaleschannelChartComponent { 
	@Input() salesDesignation: ISalesDesignation;
	@Input() hasManager = false;
	@Output() addSalesChannelOrg: EventEmitter<any> = new EventEmitter<any>();

	addSalesDesignationOrg1(tempid1:any){ 
	  this.addSalesChannelOrg.emit(tempid1);
	}

	addSalesDesignationOrg2(tempid1:any){ 
		this.addSalesChannelOrg.emit(tempid1);
	  }
}
