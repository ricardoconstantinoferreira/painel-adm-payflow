import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);

  readonly feedbackMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get emailControl() {
    return this.loginForm.controls.email;
  }

  get passwordControl() {
    return this.loginForm.controls.password;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.feedbackMessage.set(null);
      return;
    }

    this.isSubmitting.set(true);
    this.feedbackMessage.set(null);

    this.authService
      .login({
        email: this.emailControl.getRawValue(),
        password: this.passwordControl.getRawValue(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/home']);
        },
        error: (error: HttpErrorResponse) => {
          this.feedbackMessage.set(
            this.getLoginErrorMessage(error) ??
              'Nao foi possivel fazer login. Revise as credenciais e tente novamente.',
          );
        },
      });
  }

  onFirstAccess(): void {
    this.feedbackMessage.set(null);
    void this.router.navigate(['/primeiro-acesso']);
  }

  private getLoginErrorMessage(error: HttpErrorResponse): string | null {
    if (!error.error) {
      return null;
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    if (
      typeof error.error === 'object' &&
      error.error !== null &&
      'message' in error.error &&
      typeof error.error.message === 'string'
    ) {
      return error.error.message;
    }

    return null;
  }
}
