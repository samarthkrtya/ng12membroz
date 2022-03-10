import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
//import { ModuleWithProviders } from '@angular/core';
import { AdminsComponent } from './admins.component';

export const AdminsRoutes: Routes = [
  {
    path: '', component: AdminsComponent,
    children: [
      {
        path: 'admin-settings',
        loadChildren: () => import('./components/admin-settings/admin-settings.module').then(m => m.AdminSettingsModule),
      },
      {
        path: 'organization-settings',
        loadChildren: () => import('./components/organization-settings/organization-settings.module').then(m => m.OrganizationSettingsModule),
      },
      {
        path: 'mail-alerts',
        loadChildren: () => import('./components/mail-alerts/mail-alerts.module').then(m => m.MailAlertsModule),
      },
      {
        path: 'automation',
        loadChildren: () => import('./components/automation/automation.module').then(m => m.AutomationModule),
      },
      {
        path: 'reset-password',
        loadChildren: () => import('./components/reset-password/reset-pass-setting.module').then(m => m.ResetPassSettingModule),
      },
      {
        path: 'admin-booking', 
        loadChildren: () => import('./components/admin-booking/admin-booking.module').then(m => m.AdminBookingModule),
      },
      {
        path: 'activity-template', 
        loadChildren: () => import('./components/activity-template/activity-template.module').then(m => m.ActivityTemplateModule),
      },
      {
        path: 'activity-view', 
        loadChildren: () => import('./components/activity-view/activity-view.module').then(m => m.ActivityViewModule),
      },
      {
        path: 'cancellation-policy', 
        loadChildren: () => import('./components/cancellation-policy/cancellation-policy.module').then(m => m.CancellationPolicyModule),
      },
      {
        path: 'internal-notifications', 
        loadChildren: () => import('./components/internal-notifications/internal-notifications.module').then(m => m.InternalNotificationsModule),
      },
    ]
    //children: [
    // { path: 'admin-dashboard', loadChildren: './components/admin-dashboard/admin-dashboard.module#AdminDashboardModule' },
    // { path: 'admin-student-dashboard', loadChildren: './components/admin-student-dashboard/admin-student-dashboard.module#AdminStudentDashboardModule' },
    // { path: 'academicyear', loadChildren: './components/academicyear/academicyear.module#AcademicyearModule' },
    // { path: 'activities', loadChildren: './components/activities/activities.module#ActivitiesModule' },
    // { path: 'organization', loadChildren: './components/organization/organization.module#OrganizationModule' },
    // { path: 'organization-accounts', loadChildren: './components/organization-accounts/organization-accounts.module#OrganizationAccountsModule' },
    // { path: 'automation', loadChildren: './components/automation/automation.module#AutomationModule' },
    // { path: 'admin-booking', loadChildren: './components/admin-booking/admin-booking.module#AdminBookingModule' },
    // { path: 'role', loadChildren: './components/role/role.module#RoleModule' },
    // { path: 'role-permission', loadChildren: './components/role-permission/role-permission.module#RolePermissionModule' },
    // { path: 'admin-myprofile', loadChildren: './components/admin-myprofile/admin-myprofile.module#AdminMyprofileModule' },
    //{ path: 'admin-settings', loadChildren: './components/admin-settings/admin-settings.module#AdminSettingsModule' },
    // { path: 'templates', loadChildren: './components/templates/templates.module#TemplatesModule' },
    // { path: 'mail-alerts', loadChildren: './components/mail-alerts/mail-alerts.module#MailAlertsModule' },
    // { path: 'mail-merges', loadChildren: './components/mail-merges/mail-merges.module#MailMergesModule' },
    // { path: 'alert-template', loadChildren: './components/alert-template/alert-template.module#AlertTemplateModule' },
    // { path: 'tasks', loadChildren: './components/tasks/tasks.module#TasksModule' },
    // { path: 'performance-incentive', loadChildren: './components/performance-incentive/performance-incentive.module#PerformanceIncentiveModule' },
    // { path: 'attendance', loadChildren: './components/attendance/attendance.module#AttendanceModule' },
    // { path: 'bulksms', loadChildren: './components/bulksms/bulksms.module#BulksmsModule' },
    // { path: 'bulkmail', loadChildren: './components/bulkmail/bulkmail.module#BulkmailModule' },
    // { path: 'calendar', loadChildren: './components/calendar/calendar.module#CalendarModule' },
    // { path: 'resourcedata', loadChildren: './components/resourcedata/resourcedata.module#ResourcedataModule' },
    // { path: 'usermapping', loadChildren: './components/usermapping/usermapping.module#UsermappingModule' },
    // { path: 'self-services', loadChildren: './components/self-services/self-services.module#SelfServicesModule' }
    //],
  },
];
//export const routing: ModuleWithProviders = RouterModule.forChild(AdminsRoutes);

