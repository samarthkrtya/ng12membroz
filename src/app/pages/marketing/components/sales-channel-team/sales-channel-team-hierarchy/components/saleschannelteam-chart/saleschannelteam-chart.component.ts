import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ISalesTeam } from '../../sales-channel-team-hierarchy.component';

@Component({
	selector: 'ng-saleschannelteam-chart',
	templateUrl: './saleschannelteam-chart.component.html',
	styleUrls: ['./saleschannelteam-chart.component.css']
})
export class SaleschannelteamChartComponent {
	@Input() salesDesignation: ISalesTeam;
	@Input() hasManager = false;
	@Output() updateSalesChannelOrg: EventEmitter<any> = new EventEmitter<any>();

	updateSalesDesignationOrg1(tempid1: any) {
		this.updateSalesChannelOrg.emit(tempid1);
	}

	updateSalesDesignationOrg2(tempid1: any) {
		this.updateSalesChannelOrg.emit(tempid1);
	}
}
