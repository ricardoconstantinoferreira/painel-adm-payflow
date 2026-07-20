import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { AuthSessionService } from '../../../../services/auth-session.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authSessionService = inject(AuthSessionService);

  readonly pageTitle =
    (this.activatedRoute.snapshot.data['title'] as string | undefined) ??
    'Home';
  readonly pageDescription =
    (this.activatedRoute.snapshot.data['description'] as string | undefined) ??
    'Bem-vindo ao painel administrativo.';

  onLogout(): void {
    this.authSessionService.clearSession();
    void this.router.navigate(['/']);
  }
}
