import { Routes } from '@angular/router';

import { PagesComponent } from './pages.component';
import { LoginComponent } from './login/login.component';

import { AuthGuard } from '../core/services/common/auth-guard.service';
import { UserCheckinComponent } from './user-checkin/user-checkin.component';
import { XeroComponent } from './xero/xero.component';

export const PagesRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'user-checkin',
        component: UserCheckinComponent
    },
    {
        path: 'login/:type',
        component: LoginComponent
    },
    {
        path: 'reset-user-pass',
        loadChildren: () => import('./resetuserpassword/resetuserpassword.module').then(m => m.ResetuserpasswordModule),
    },
    {
        path: 'reset',
        loadChildren: () => import('./reset-password/reset-password.module').then(m => m.ResetPasswordModule),
    },
    {
        path: 'xerocallback',
        component: XeroComponent
    },
    {
        path: 'pages', component: PagesComponent,
        children: [
            { path: '', redirectTo: 'dynamic-dashboard', pathMatch: 'full', canActivate: [AuthGuard] },
            {
                path: 'dashboard',
                loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
                canActivate: [AuthGuard]
            },

            {
                path: 'members',
                loadChildren: () => import('./members/members.module').then(m => m.MembersModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'facility',
                loadChildren: () => import('./facility/facility.module').then(m => m.FacilityModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'user',
                loadChildren: () => import('./user/user.module').then(m => m.UserModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'branch',
                loadChildren: () => import('./branch/branch.module').then(m => m.BranchModule),
                canActivate: [AuthGuard]

            },
            {
                path: 'role',
                loadChildren: () => import('./role/role.module').then(m => m.RoleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'form',
                loadChildren: () => import('./form/form.module').then(m => m.FormModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'membership',
                loadChildren: () => import('./membership/membership.module').then(m => m.MembershipModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'dynamic-forms',
                loadChildren: () => import('./dynamic-forms/dynamic-forms.module').then(m => m.DynamicFormsModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'dynamic-list',
                loadChildren: () => import('./dynamic-list/dynamic-list.module').then(m => m.DynamicListModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'dynamic-list-wf',
                loadChildren: () => import('./dynamic-workflow-list/dynamic-workflow-list.module').then(m => m.DynamicWorkflowListModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'dynamic-dashboard',
                loadChildren: () => import('./dynamic-dashboard/dynamic-dashboard.module').then(m => m.DynamicDashboardModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'dynamic-preview-list',
                loadChildren: () => import('./dynamic-preview-list/dynamic-preview-list.module').then(m => m.DynamicPreviewListModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'dynamic-reports',
                loadChildren: () => import('./dynamic-reports/dynamic-reports.module').then(m => m.DynamicReportsModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'billitem',
                loadChildren: () => import('./billitem/billitem.module').then(m => m.BillitemModule),
                canActivate: [AuthGuard]
            },

            {
                path: 'menublocklist',
                loadChildren: () => import('./menublocklist/menublocklist.module').then(m => m.MenublocklistModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'purchase-module',
                loadChildren: () => import('./purchase-module/purchase-module.module').then(m => m.PurchaseModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'sale-module',
                loadChildren: () => import('./sale-module/sale-module.module').then(m => m.SaleModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'import',
                loadChildren: () => import('./import/import.module').then(m => m.ImportModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'product-module',
                loadChildren: () => import('./product-module/product-module.module').then(m => m.ProductModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'finance-module',
                loadChildren: () => import('./finance-module/finance-module.module').then(m => m.FinanceModuleModule),
                canActivate: [AuthGuard]
            },

            {
                path: 'service-module',
                loadChildren: () => import('./service-module/service-module.module').then(m => m.ServiceModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'payment-module',
                loadChildren: () => import('./payment-module/payment-module.module').then(m => m.PaymentModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'calendar',
                loadChildren: () => import('./calendars/calendars.module').then(m => m.CalendarsModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'appointment-module',
                loadChildren: () => import('./appointment-module/appointment-module.module').then(m => m.AppointmentModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'booking-module',
                loadChildren: () => import('./booking-module/booking-module.module').then(m => m.BookingModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'facility-booking-module',
                loadChildren: () => import('./facility-booking-module/facility-booking-module.module').then(m => m.FacilityBookingModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'package-booking',
                loadChildren: () => import('./package-booking/package-booking.module').then(m => m.PackageBookingModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'lead-module',
                loadChildren: () => import('./lead-module/lead-module.module').then(m => m.LeadModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'campaign-module',
                loadChildren: () => import('./campaign-module/campaign-module.module').then(m => m.CampaignModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'campaign',
                loadChildren: () => import('./campaign/campaign.module').then(m => m.CampaignModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'customer-module',
                loadChildren: () => import('./customer-module/customer-module.module').then(m => m.CustomerModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'vendor-module',
                loadChildren: () => import('./vendor-module/vendor-module.module').then(m => m.VendorModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'admins',
                loadChildren: () => import('./admins/admins.module').then(m => m.AdminsModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'setup',
                loadChildren: () => import('./setup/setup.module').then(m => m.SetupModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'document-gallery',
                loadChildren: () => import('./document-gallery-module/document-gallery-module.module').then(m => m.DocumentGalleryModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'test',
                loadChildren: () => import('./test/test.module').then(m => m.TestModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'integration-module',
                loadChildren: () => import('./integration-module/integration-module.module').then(m => m.IntegrationModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'document-module',
                loadChildren: () => import('./document-module/document-module.module').then(m => m.DocumentModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'marketing',
                loadChildren: () => import('./marketing/marketing.module').then(m => m.MarketingModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'payroll-module',
                loadChildren: () => import('./payroll-module/payroll-module.module').then(m => m.PayrollModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'support-module',
                loadChildren: () => import('./support-module/support-module.module').then(m => m.SupportModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'job-order',
                loadChildren: () => import('./job-order/job-order.module').then(m => m.JobOrderModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'lease-order',
                loadChildren: () => import('./lease-order/lease-order.module').then(m => m.LeaseOrderModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'myprofile',
                loadChildren: () => import('./myprofile/myprofile.module').then(m => m.MyprofileModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'myaccount',
                loadChildren: () => import('./myaccount/myaccount.module').then(m => m.MyAccountModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'disposition-module',
                loadChildren: () => import('./disposition-module/disposition-module.module').then(m => m.DispositionModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'formdata',
                loadChildren: () => import('./formdata/formdata.module').then(m => m.FormdataModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'event',
                loadChildren: () => import('./event/event.module').then(m => m.EventModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'wallet-module',
                loadChildren: () => import('./wallet-modules/wallet-modules.module').then(m => m.WalletModulesModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'weekschedule-module',
                loadChildren: () => import('./week-schedule-module/week-schedule-module.module').then(m => m.WeekScheduleModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'asset-module',
                loadChildren: () => import('./asset-module/asset-module.module').then(m => m.AssetModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'inspection-module',
                loadChildren: () => import('./inspection-module/inspection-module.module').then(m => m.InspectionModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'inventory-module',
                loadChildren: () => import('./inventory-module/inventory-module.module').then(m => m.InventoryModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'live-chat',
                loadChildren: () => import('./live-chat/live-chat.module').then(m => m.LiveChatModule),
                canActivate: [AuthGuard]
            },
            {
              path: 'billing',
              loadChildren: () => import('./bill/billing.module').then(m => m.BillingModule),
              canActivate: [AuthGuard]
            },
            {
              path: 'invite-earn',
              loadChildren: () => import('./invite-earn/invite-earn.module').then(m => m.InviteEarnModule),
              canActivate: [AuthGuard]
            },
            {
                path: 'property-module',
                loadChildren: () => import('./property-module/property-module.module').then(m => m.PropertyModuleModule),
                canActivate: [AuthGuard]
            },
            {
                path: 'template-module',
                loadChildren: () => import('./template-module/template-module.module').then(m => m.TemplateModule),
                canActivate: [AuthGuard]
            },
            {           // Wildcard Route (--Do not change--)
                path: '**',
                loadChildren: () => import('../pages/not-found-component/not-found-component.module').then(m => m.NotFoundComponentModule),
            },
        ]
    }

];
