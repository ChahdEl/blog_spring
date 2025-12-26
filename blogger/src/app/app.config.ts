// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
// import { routes } from './app.routes';
// import { authInterceptor } from './services/auth.interceptor';
// import {
//   SocialAuthServiceConfig,
//   GoogleLoginProvider,
//   GoogleSigninButtonModule
// } from '@abacritt/angularx-social-login';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes),
//     provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
//     {
//       provide: 'SocialAuthServiceConfig',
//       useValue: {
//         autoLogin: false,
//         // providers: [
//         //   {
//         //     id: GoogleLoginProvider.PROVIDER_ID,
//         //     provider: new GoogleLoginProvider(
//         //       'client_id'
//         //     )
//         //   }
//         // ],
//         onError: (err) => {
//           console.error('Social auth error:', err);
//         }
//       } as SocialAuthServiceConfig,
//     }
//   ]
// };
